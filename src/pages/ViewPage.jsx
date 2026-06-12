import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getCardById } from '../lib/supabase'
import { formatDate } from '../lib/utils'
import html2canvas from 'html2canvas'

const DEFAULT_BLESSING = `岁岁平安
万事顺遂
所愿皆所得
所行皆坦途
生日快乐 🎂`

export default function ViewPage() {
  const { cardId } = useParams()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    async function load() {
      const localData = sessionStorage.getItem('card_data')
      if (localData) {
        const data = JSON.parse(localData)
        if (data.id == cardId) {
          setCard(data)
          setLoading(false)
          setTimeout(() => setShowContent(true), 100)
          return
        }
      }
      const dbCard = await getCardById(cardId)
      if (dbCard) setCard(dbCard)
      setLoading(false)
      setTimeout(() => setShowContent(true), 100)
    }
    load()
  }, [cardId])

  const handleSave = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true })
      const link = document.createElement('a')
      link.download = `生日贺卡_${card?.name || 'birthday'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('保存失败，请截图保存')
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.origin + `/card/${cardId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: '🎂 专属生日贺卡', text: '有人给你发了一张生日贺卡！', url: shareUrl })
      } catch {}
    } else {
      await navigator.clipboard?.writeText(shareUrl)
      alert('链接已复制，快去分享吧！')
    }
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="text-5xl animate-bounce">🎂</div></div>
  }

  if (!card) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">😢</div>
        <p className="text-pink-500 mb-4">贺卡不存在或已过期</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-pink-500 text-white rounded-full">返回首页</button>
      </div>
    )
  }

  const blessingLines = (card.blessing || DEFAULT_BLESSING).split('\n').filter(Boolean)

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4">
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-pink-100"
        style={{ background: 'linear-gradient(180deg, #fff5f8 0%, #fff0e8 50%, #ffe8f0 100%)' }}
      >
        <div className={`text-center py-8 px-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-3xl mb-2">🎂</p>
          <h1 className="text-2xl font-bold text-pink-600 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>HAPPY BIRTHDAY</h1>
          <p className="text-3xl mt-1">🎂</p>
        </div>
        <div className={`text-center px-6 mb-4 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-base text-pink-400 mb-1">亲爱的</p>
          <h2 className="text-2xl font-bold text-pink-600" style={{ fontFamily: 'var(--font-display)' }}>{card.name}</h2>
          <p className="text-sm text-pink-400 mt-1">今天是属于你的特别日子 ✨</p>
        </div>
        {card.photo_url && (
          <div className={`px-6 mb-4 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <img src={card.photo_url} alt="birthday" className="w-full h-48 object-cover" crossOrigin="anonymous" />
            </div>
          </div>
        )}
        <div className={`text-center px-6 mb-4 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 bg-pink-100/60 px-4 py-1.5 rounded-full">
            <span>📅</span>
            <span className="text-sm text-pink-600 font-medium">{formatDate(card.solar_birthday)}</span>
          </div>
        </div>
        <div className={`px-8 mb-6 transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <p className="text-sm text-pink-500 mb-3 font-medium">愿你：</p>
            <div className="space-y-2">
              {blessingLines.map((line, i) => (
                <p key={i} className="text-base text-pink-700 font-medium" style={{ fontFamily: 'var(--font-display)' }}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        {card.sender && (
          <div className={`text-center px-6 mb-6 transition-all duration-700 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm text-pink-400">—— 来自 <span className="font-semibold text-pink-500">{card.sender}</span> 的祝福</p>
          </div>
        )}
        <div className="text-center py-4 text-2xl">🎀🎉🎈</div>
      </div>

      <div className={`w-full max-w-sm mt-6 space-y-3 transition-all duration-700 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button onClick={handleSave} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          📥 保存图片
        </button>
        <button onClick={handleShare} className="w-full py-3 bg-white/80 border-2 border-pink-200 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          💌 分享好友
        </button>
      </div>
    </div>
  )
}
