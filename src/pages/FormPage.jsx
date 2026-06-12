import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { createCard, uploadPhoto } from '../lib/supabase'
import { generateToken, generatePassword } from '../lib/utils'

export default function FormPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || generateToken()

  const [form, setForm] = useState({
    name: '',
    birthday: '',
    photo: null,
    sender: '',
    blessing: '',
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB')
      return
    }
    setForm(prev => ({ ...prev, photo: file }))
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入姓名'
    if (!form.birthday) errs.birthday = '请选择生日'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const password = generatePassword(form.birthday)
      const cardData = {
        token,
        name: form.name.trim(),
        solar_birthday: form.birthday,
        password,
        photo_url: null,
        sender: form.sender.trim() || '',
        blessing: form.blessing.trim() || '生日快乐！愿你岁岁平安，万事顺遂！',
        status: 'pending',
      }

      const card = await createCard(cardData)

      if (form.photo && card.id) {
        try {
          const photoUrl = await uploadPhoto(form.photo, card.id)
          cardData.photo_url = photoUrl
        } catch {
          // Photo upload failed, continue without it
        }
      }

      // Store locally for the generation animation
      sessionStorage.setItem('card_data', JSON.stringify({
        ...cardData,
        id: card.id,
      }))

      navigate('/generating')
    } catch (err) {
      alert('提交失败，请重试: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 px-5 py-8 max-w-md mx-auto w-full animate-fade-in-up">
      <h1 className="text-2xl font-bold text-pink-600 mb-1 text-center"
          style={{ fontFamily: 'var(--font-display)' }}>
        ✏️ 填写生日信息
      </h1>
      <p className="text-sm text-pink-400 mb-6 text-center">
        为 TA 定制专属贺卡
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">
            姓名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="请输入姓名"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white/80 backdrop-blur focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">
            阳历生日 <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white/80 backdrop-blur focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm"
          />
          {errors.birthday && <p className="mt-1 text-xs text-red-400">{errors.birthday}</p>}
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">
            上传照片 <span className="text-pink-300 font-normal">(选填)</span>
          </label>
          <div className="relative">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-pink-200">
                <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setForm(p => ({ ...p, photo: null })) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/60"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-pink-300 rounded-xl bg-white/50 hover:bg-pink-50 cursor-pointer transition-colors">
                <span className="text-3xl mb-1">📷</span>
                <span className="text-xs text-pink-400">点击上传照片 (JPG/PNG, 最大10MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Sender */}
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">
            祝福人 <span className="text-pink-300 font-normal">(选填)</span>
          </label>
          <input
            type="text"
            name="sender"
            value={form.sender}
            onChange={handleChange}
            placeholder="例如：你的好朋友 小红"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white/80 backdrop-blur focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm"
          />
        </div>

        {/* Blessing */}
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">
            祝福语 <span className="text-pink-300 font-normal">(选填)</span>
          </label>
          <textarea
            name="blessing"
            value={form.blessing}
            onChange={handleChange}
            placeholder="写下你的祝福吧..."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white/80 backdrop-blur focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm resize-none"
          />
          <p className="mt-1 text-xs text-right text-pink-300">{form.blessing.length}/200</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              提交中...
            </span>
          ) : '🎁 生成生日贺卡'}
        </button>
      </form>
    </div>
  )
}
