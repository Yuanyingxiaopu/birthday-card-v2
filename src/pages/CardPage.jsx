import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCardById } from '../lib/supabase'
import { encodeCardData } from '../lib/utils'
import { getTheme, loadTheme } from '../lib/theme'
import PasswordInput from '../components/PasswordInput'

const DEFAULT_BLESSING = `岁岁平安
万事顺遂
所愿皆所得
所行皆坦途
生日快乐 🎂`

export default function CardPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [needPassword, setNeedPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    async function load() {
      const localData = sessionStorage.getItem('card_data')
      if (localData) {
        const data = JSON.parse(localData)
        if (data.id == cardId) {
          setCard(data)
          const verified = sessionStorage.getItem('card_verified_' + cardId)
          if (verified === 'true') {
            setTimeout(() => setShowContent(true), 100)
          } else {
            setNeedPassword(true)
          }
          setLoading(false)
          return
        }
      }
      const dbCard = await getCardById(cardId)
      if (dbCard) { setCard(dbCard); setNeedPassword(true) }
      setLoading(false)
    }
    load()
  }, [cardId])

  const handlePwSubmit = (e) => {
    e.preventDefault()
    if (!card) return
    if (password.length !== 4) { setPwError('请输入4位密码'); return }
    if (password === card.password) {
      sessionStorage.setItem('card_verified_' + cardId, 'true')
      setNeedPassword(false)
      setTimeout(() => setShowContent(true), 100)
    } else {
      setPwError('密码错误，请重新输入')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/greet/${encodeCardData(card)}`
    const shareText = `${card?.sender || '有人'}给你发了一张生日贺卡，快来看看吧！`
    if (navigator.share) {
      try { await navigator.share({ title: '🎂 专属生日贺卡', text: shareText, url: shareUrl }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }
      catch { prompt('复制以下链接分享给好友：', shareUrl) }
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="text-5xl animate-bounce">🎂</div></div>

  if (!card) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-4">😢</div>
      <p className="text-pink-500 mb-4">贺卡不存在或已过期</p>
      <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-pink-500 text-white rounded-full">返回首页</button>
    </div>
  )

  const t = getTheme(card.theme || loadTheme())

  if (needPassword) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      <div className="text-6xl mb-4">🎂</div>
      <p className="text-lg mb-1" style={{ color: t.text }}>{card.name} 的生日贺卡已生成</p>
      <p className="text-sm mb-6" style={{ color: t.primaryLight }}>输入生日密码查看</p>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: t.primary }}>请输入生日密码</h2>
      <p className="text-sm mb-2 text-center" style={{ color: t.primaryLight }}>密码为生日的<span className="font-semibold" style={{ color: t.primary }}>月日</span>（4位数字）</p>

      <form onSubmit={handlePwSubmit} className="w-full max-w-xs">
        <PasswordInput value={password} onChange={setPassword} shake={shake} themeId={card.theme} />
        {pwError && <p className="text-center text-sm text-red-400 mb-3">{pwError}</p>}
        <button type="submit" disabled={password.length < 4}
          className="w-full py-3.5 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ background: t.primary, boxShadow: `0 4px 16px ${t.primary}40` }}>
          🔓 打开贺卡
        </button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  )

  const blessingLines = (card.blessing || DEFAULT_BLESSING).split('\n').filter(Boolean)

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-sm bg-white/90 rounded-3xl shadow-2xl overflow-hidden" style={{ background: t.gradient }}>
        <div className={`text-center py-8 px-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-3xl mb-2">🎂</p>
          <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: t.dot }}>HAPPY BIRTHDAY</h1>
          <p className="text-3xl mt-1">🎂</p>
        </div>
        <div className={`text-center px-6 mb-4 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-base mb-1" style={{ color: t.primaryLight }}>亲爱的</p>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: t.primary }}>{card.name}</h2>
          <p className="text-sm mt-1" style={{ color: t.primaryLight }}>今天是属于你的特别日子 ✨</p>
        </div>
        {card.photo_url && (
          <div className={`px-6 mb-4 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <img src={card.photo_url} alt="birthday" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        )}
        <div className={`text-center px-6 mb-4 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: t.dot + '18' }}>
            <span>📅</span>
            <span className="text-sm font-medium" style={{ color: t.dot }}>{card.solar_birthday}</span>
          </div>
        </div>
        <div className={`px-8 mb-6 transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <p className="text-sm mb-3 font-medium" style={{ color: t.primaryLight }}>愿你：</p>
            <div className="space-y-2">
              {blessingLines.map((line, i) => <p key={i} className="text-base font-medium" style={{ fontFamily: 'var(--font-display)', color: t.text }}>{line}</p>)}
            </div>
          </div>
        </div>
        {card.sender && (
          <div className={`text-center px-6 mb-6 transition-all duration-700 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm" style={{ color: t.primaryLight }}>—— 来自 <span className="font-semibold" style={{ color: t.primary }}>{card.sender}</span> 的祝福</p>
          </div>
        )}
        <div className="text-center py-4 text-2xl">🎀🎉🎈</div>
      </div>

      <div className={`w-full max-w-sm mt-6 space-y-3 transition-all duration-700 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button onClick={handleShare}
          className="w-full py-4 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ background: t.primary, boxShadow: `0 6px 20px ${t.primary}50` }}>
          {copied ? '✅ 链接已复制' : '💌 分享给好友'}
        </button>
        <button onClick={() => { sessionStorage.removeItem('card_data'); window.location.href = '/' }}
          className="w-full py-3 bg-white/60 border border-gray-200 rounded-xl hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
          style={{ color: t.text }}>
          🔄 再做一张
        </button>
      </div>
    </div>
  )
}
