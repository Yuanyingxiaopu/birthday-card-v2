import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { createCard, uploadPhoto, updateCard } from '../lib/supabase'
import { generateToken, saveDraft, loadDrafts, loadLatestDraft, deleteDraft } from '../lib/utils'
import { tryStartMusic } from '../components/BackgroundMusic'
import { THEMES, saveTheme, loadTheme } from '../lib/theme'

export default function FormPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || generateToken()

  const [form, setForm] = useState({ name: '', birthday: '', photo: null, sender: '', blessing: '' })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [drafts, setDrafts] = useState([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [theme, setTheme] = useState(loadTheme())

  useEffect(() => {
    if (!sessionStorage.getItem('access_verified')) {
      navigate('/', { replace: true })
      return
    }
    const latest = loadLatestDraft()
    if (latest && (latest.name || latest.birthday || latest.sender || latest.blessing)) {
      setForm(prev => ({ ...prev, name: latest.name || '', birthday: latest.birthday || '', sender: latest.sender || '', blessing: latest.blessing || '' }))
    }
    setDrafts(loadDrafts())
  }, [])

  useEffect(() => {
    if (form.name || form.birthday || form.sender || form.blessing) { saveDraft(form); setDrafts(loadDrafts()) }
  }, [form.name, form.birthday, form.sender, form.blessing])

  const [birthMonth, birthDay] = (form.birthday || '-').split('-')
  const setBirthMonth = (m) => { const d = birthDay || ''; setForm(p => ({ ...p, birthday: m && d ? `${m}-${d}` : m ? `${m}-` : '' })); if (errors.birthday) setErrors(p => ({ ...p, birthday: '' })) }
  const setBirthDay = (d) => { const m = birthMonth || ''; setForm(p => ({ ...p, birthday: m && d ? `${m}-${d}` : d ? `-${d}` : '' })); if (errors.birthday) setErrors(p => ({ ...p, birthday: '' })) }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('图片大小不能超过 10MB'); return }
    setForm(p => ({ ...p, photo: file })); setPreview(URL.createObjectURL(file))
  }

  const handleLoadDraft = (draft) => {
    setForm(p => ({ ...p, name: draft.name || '', birthday: draft.birthday || '', sender: draft.sender || '', blessing: draft.blessing || '', photo: null }))
    setPreview(null); setShowDrafts(false)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入姓名'
    if (!birthMonth || !birthDay) errs.birthday = '请选择生日月日'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    tryStartMusic()
    setLoading(true)
    saveTheme(theme)
    try {
      const password = birthMonth + birthDay
      const cardData = { token, name: form.name.trim(), solar_birthday: form.birthday, password, photo_url: null, sender: form.sender.trim() || '', blessing: form.blessing.trim() || '生日快乐！愿你岁岁平安，万事顺遂！', theme, status: 'pending' }
      const card = await createCard(cardData)
      if (form.photo && card.id) {
        try {
          const photoUrl = await uploadPhoto(form.photo, card.id)
          cardData.photo_url = photoUrl
          // 把照片URL写回数据库，否则从数据库读的访问者（包括分享对象）看不到图
          await updateCard(card.id, { photo_url: photoUrl })
        } catch (err) {
          console.warn('照片上传失败:', err)
        }
      }
      sessionStorage.setItem('card_data', JSON.stringify({ ...cardData, id: card.id }))
      navigate('/generating')
    } catch (err) { alert('提交失败，请重试: ' + err.message); setLoading(false) }
  }

  const t = THEMES.find(x => x.id === theme) || THEMES[0]

  return (
    <div className="flex-1 px-5 py-8 max-w-md mx-auto w-full animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: t.primary }}>
        ✏️ 填写生日信息
      </h1>
      <p className="text-sm mb-6 text-center" style={{ color: t.primaryLight }}>为 TA 定制专属贺卡</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Theme picker */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: t.text }}>选择风格</label>
          <div className="flex gap-2">
            {THEMES.map(th => (
              <button key={th.id} type="button" onClick={() => { setTheme(th.id); saveTheme(th.id) }}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border-2"
                style={{
                  background: th.card,
                  borderColor: theme === th.id ? th.primary : '#e0e0e0',
                  color: th.text,
                  boxShadow: theme === th.id ? `0 3px 12px ${th.primary}40` : 'none',
                  transform: theme === th.id ? 'scale(1.05)' : 'scale(1)',
                }}>
                {th.name}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>姓名 <span className="text-red-400">*</span></label>
          <input type="text" name="name" value={form.name}
            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
            placeholder="请输入姓名" maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-all text-sm"
            style={{ borderColor: t.border }} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>生日 <span className="text-red-400">*</span></label>
          <div className="flex gap-3">
            <select value={birthMonth || ''} onChange={e => setBirthMonth(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-all text-sm"
              style={{ borderColor: t.border }}>
              <option value="">选择月</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{i + 1}月</option>)}
            </select>
            <select value={birthDay || ''} onChange={e => setBirthDay(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-all text-sm"
              style={{ borderColor: t.border }}>
              <option value="">选择日</option>
              {Array.from({ length: 31 }, (_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{i + 1}日</option>)}
            </select>
          </div>
          {errors.birthday && <p className="mt-1 text-xs text-red-400">{errors.birthday}</p>}
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>上传照片 <span style={{ color: t.primaryLight }}>(选填)</span></label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border-2" style={{ borderColor: t.border }}>
              <img src={preview} alt="preview" className="w-full h-48 object-cover" />
              <button type="button" onClick={() => { setPreview(null); setForm(p => ({ ...p, photo: null })) }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center text-sm">✕</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl bg-white/50 hover:bg-white cursor-pointer transition-colors"
              style={{ borderColor: t.border }}>
              <span className="text-3xl mb-1">📷</span>
              <span className="text-xs" style={{ color: t.primaryLight }}>点击上传照片 (JPG/PNG, 最大10MB)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>

        {/* Sender */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>祝福人 <span style={{ color: t.primaryLight }}>(选填)</span></label>
          <input type="text" name="sender" value={form.sender} onChange={e => setForm(p => ({ ...p, sender: e.target.value }))}
            placeholder="例如：你的好朋友 小红" maxLength={30}
            className="w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-all text-sm"
            style={{ borderColor: t.border }} />
        </div>

        {/* Blessing */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>祝福语 <span style={{ color: t.primaryLight }}>(选填)</span></label>
          <textarea name="blessing" value={form.blessing} onChange={e => setForm(p => ({ ...p, blessing: e.target.value }))}
            placeholder="写下你的祝福吧..." maxLength={200} rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-all text-sm resize-none"
            style={{ borderColor: t.border }} />
          <p className="mt-1 text-xs text-right" style={{ color: t.primaryLight }}>{form.blessing.length}/200</p>
        </div>

        {/* Submit - KEY BUTTON */}
        <button type="submit" disabled={loading}
          className="w-full py-4 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          style={{ background: t.primary, boxShadow: `0 6px 20px ${t.primary}50` }}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              提交中...
            </span>
          ) : '🎁 生成生日贺卡'}
        </button>

        {/* Draft box - SECONDARY */}
        <button type="button" onClick={() => setShowDrafts(!showDrafts)}
          className="w-full py-2.5 bg-white/60 border border-gray-200 rounded-xl hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
          style={{ color: t.text }}>
          📋 草稿箱 {drafts.length > 0 && <span className="text-xs text-white px-1.5 py-0.5 rounded-full" style={{ background: t.primaryLight }}>{drafts.length}</span>}
        </button>

        {showDrafts && drafts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {drafts.map(d => (
              <div key={d.id} className="px-3 py-2.5 border-b border-gray-100 last:border-b-0 flex items-center justify-between">
                <button type="button" onClick={() => handleLoadDraft(d)} className="flex-1 text-left">
                  <p className="text-sm font-medium truncate" style={{ color: t.text }}>{d.name || '未命名'} {d.birthday ? `· ${d.birthday}` : ''}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.savedAt}</p>
                </button>
                <button type="button" onClick={() => { setDrafts(deleteDraft(d.id)) }} className="text-gray-300 hover:text-red-400 ml-2 text-sm">✕</button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
