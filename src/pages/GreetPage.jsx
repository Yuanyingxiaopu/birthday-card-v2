import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { decodeCardData } from '../lib/utils'
import { getTheme } from '../lib/theme'
import PasswordInput from '../components/PasswordInput'

const DEFAULT_BLESSING = `岁岁平安
万事顺遂
所愿皆所得
所行皆坦途
生日快乐 🎂`

export default function GreetPage() {
  const { data } = useParams()
  const [card, setCard] = useState(null)
  const [verified, setVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (data) {
      const decoded = decodeCardData(data)
      if (decoded) setCard(decoded)
    }
  }, [data])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!card) return
    if (password.length !== 4) { setError('请输入4位密码'); return }
    if (card.password === password) {
      setVerified(true)
      setTimeout(() => setShowContent(true), 100)
    } else {
      setError('密码错误，请重新输入')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    }
  }

  if (!card) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-4">😢</div>
      <p className="text-pink-500 mb-4">贺卡链接无效</p>
      <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-pink-500 text-white rounded-full">去制作一张</button>
    </div>
  )

  const t = getTheme(card.theme)

  if (!verified) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      <div className="text-6xl mb-4">🎂</div>
      <p className="text-lg mb-1" style={{ color: t.text }}>{card.name} 收到一张生日贺卡</p>
      <p className="text-sm mb-6" style={{ color: t.primaryLight }}>输入密码即可查看</p>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: t.primary }}>请输入生日密码</h2>
      <p className="text-sm mb-2 text-center" style={{ color: t.primaryLight }}>密码为生日对应的<span className="font-semibold" style={{ color: t.primary }}>月日</span>（4位数字）</p>

      <div className="bg-white/70 rounded-xl p-3 mb-5 text-sm border border-gray-200 max-w-xs w-full">
        <p className="font-medium mb-1" style={{ color: t.text }}>例如：</p>
        <p style={{ color: t.primaryLight }}>生日 6月12日 → 密码 <span className="font-bold tracking-widest" style={{ color: t.primary }}>0612</span></p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <PasswordInput value={password} onChange={setPassword} shake={shake} themeId={card.theme} />
        {error && <p className="text-center text-sm text-red-400 mb-3">{error}</p>}
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
          <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: t.primary }}>HAPPY BIRTHDAY</h1>
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
              <img src={card.photo_url} alt="birthday" className="w-full h-48 object-cover" crossOrigin="anonymous" />
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
    </div>
  )
}
