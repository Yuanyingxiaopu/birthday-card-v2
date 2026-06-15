import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { tryStartMusic } from '../components/BackgroundMusic'
import { activateCode, isCodeValid, isCodeActivated, getCodeRemainingDays } from '../lib/supabase'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlCode = searchParams.get('code')

  const [status, setStatus] = useState('loading') // loading | verified | expired | invalid
  const [remainingDays, setRemainingDays] = useState(0)

  useEffect(() => {
    if (!urlCode) {
      setStatus('invalid')
      return
    }
    const code = urlCode.toUpperCase()
    let cancelled = false

    ;(async () => {
      try {
        const activated = await isCodeActivated(code)
        if (!activated) {
          await activateCode(code)
        }

        const valid = await isCodeValid(code)
        if (cancelled) return

        if (valid) {
          const days = await getCodeRemainingDays(code)
          if (cancelled) return
          setRemainingDays(days)
          setStatus('verified')
          sessionStorage.setItem('access_verified', 'true')
          sessionStorage.setItem('access_code', code)
        } else {
          setStatus('expired')
        }
      } catch (err) {
        console.warn('激活码校验失败:', err)
        if (!cancelled) setStatus('expired')
      }
    })()

    return () => { cancelled = true }
  }, [urlCode])

  const handleStart = () => {
    tryStartMusic()
    navigate('/form')
  }

  // 加载中
  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <span className="text-5xl mb-4 animate-bounce">🎂</span>
        <p className="text-sm text-pink-400">正在加载...</p>
      </div>
    )
  }

  // 已验证：显示进入按钮
  if (status === 'verified') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
        <div className="flex gap-6 mb-8">
          <span className="text-5xl balloon" style={{ animationDelay: '0s' }}>🎈</span>
          <span className="text-6xl balloon" style={{ animationDelay: '0.5s' }}>🎂</span>
          <span className="text-5xl balloon" style={{ animationDelay: '1s' }}>🎈</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-3 text-center"
            style={{ fontFamily: 'var(--font-display)' }}>
          🎂 专属生日贺卡
        </h1>

        <p className="text-sm text-pink-300 mb-8 text-center">
          有效期剩余 {remainingDays} 天
        </p>

        <button
          onClick={handleStart}
          className="animate-pulse-glow inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <span>✨</span>
          立即开始
          <span>✨</span>
        </button>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm w-full">
          {[
            { icon: '🎨', text: '专属定制' },
            { icon: '📸', text: '照片上传' },
            { icon: '🎵', text: '温馨祝福' },
          ].map(f => (
            <div key={f.icon} className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs text-pink-400">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 链接过期
  if (status === 'expired') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
        <span className="text-5xl mb-6">😢</span>
        <h1 className="text-2xl font-bold text-pink-600 mb-2 text-center"
            style={{ fontFamily: 'var(--font-display)' }}>
          链接已过期
        </h1>
        <p className="text-sm text-pink-400 text-center">
          有效期已过，请联系卖家获取新链接
        </p>
      </div>
    )
  }

  // 没有code参数或无效链接
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      <span className="text-5xl mb-6">🎂</span>
      <h1 className="text-2xl md:text-3xl font-bold text-pink-600 mb-2 text-center"
          style={{ fontFamily: 'var(--font-display)' }}>
        专属生日贺卡
      </h1>
      <p className="text-sm text-pink-400 text-center">
        请通过有效链接访问
      </p>
    </div>
  )
}
