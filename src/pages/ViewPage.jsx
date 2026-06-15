import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDate, decodeCardData } from '../lib/utils'

const DEFAULT_BLESSING = `岁岁平安
万事顺遂
所愿皆所得
所行皆坦途
生日快乐 🎂`

export default function ViewPage() {
  const { data } = useParams()
  const [card, setCard] = useState(null)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (data) {
      const decoded = decodeCardData(data)
      if (decoded) {
        setCard(decoded)
        setTimeout(() => setShowContent(true), 100)
      }
    }
  }, [data])

  if (!card) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">😢</div>
        <p className="text-pink-500 mb-4">贺卡链接无效</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-pink-500 text-white rounded-full">
          去制作一张
        </button>
      </div>
    )
  }

  const blessingLines = (card.blessing || DEFAULT_BLESSING).split('\n').filter(Boolean)

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4">
      <div
        className="w-full max-w-sm bg-white/90 rounded-3xl shadow-2xl overflow-hidden border border-pink-100"
        style={{ background: 'linear-gradient(180deg, #fff5f8 0%, #fff0e8 50%, #ffe8f0 100%)' }}
      >
        <div className={`text-center py-8 px-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-3xl mb-2">🎂</p>
          <h1 className="text-2xl font-bold text-pink-600 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            HAPPY BIRTHDAY
          </h1>
          <p className="text-3xl mt-1">🎂</p>
        </div>

        <div className={`text-center px-6 mb-4 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-base text-pink-400 mb-1">亲爱的</p>
          <h2 className="text-2xl font-bold text-pink-600" style={{ fontFamily: 'var(--font-display)' }}>{card.name}</h2>
          <p className="text-sm text-pink-400 mt-1">今天是属于你的特别日子 ✨</p>
        </div>

        {card.photo_url && (
          <div className={`px-6 mb-4 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-black/5">
              <img src={card.photo_url} alt="birthday" className="w-full max-h-80 object-contain" referrerPolicy="no-referrer" />
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

      <div className={`w-full max-w-sm mt-6 transition-all duration-700 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          ✨ 我也要做一张
        </button>
      </div>
    </div>
  )
}
