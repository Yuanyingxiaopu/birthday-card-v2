import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { tryStartMusic } from '../components/BackgroundMusic'
import { activateCode, isCodeValid, isCodeActivated, getCodeRemainingDays } from '../lib/utils'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlCode = searchParams.get('code')

  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)

  useEffect(() => {
    if (urlCode && isCodeValid(urlCode)) {
      setRemainingDays(getCodeRemainingDays(urlCode))
      setVerified(true)
      sessionStorage.setItem('access_verified', 'true')
      sessionStorage.setItem('access_code', urlCode)
    }
  }, [urlCode])

  const handleVerify = () => {
    const code = inputCode.trim().toUpperCase()
    setError('')

    if (!code) {
      setError('请输入验证码')
      return
    }

    // 验证码必须匹配 URL 中的 code（如果有）
    if (urlCode && code !== urlCode.toUpperCase()) {
      setError('验证码错误')
      return
    }

    // 没有 URL code 时，检查是否已激活且有效
    if (!urlCode) {
      if (!isCodeActivated(code)) {
        setError('验证码无效')
        return
      }
      if (!isCodeValid(code)) {
        setError('验证码已过期，请联系卖家获取新验证码')
        return
      }
    } else {
      // 有 URL code，检查是否已过期
      if (isCodeActivated(code) && !isCodeValid(code)) {
        setError('验证码已过期，请联系卖家获取新验证码')
        return
      }
    }

    activateCode(code)
    sessionStorage.setItem('access_verified', 'true')
    sessionStorage.setItem('access_code', code)
    setVerified(true)
    setRemainingDays(getCodeRemainingDays(code))
  }

  const handleStart = () => {
    tryStartMusic()
    navigate('/form')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify()
  }

  // 已验证：显示进入按钮
  if (verified) {
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
          验证已通过 · 剩余 {remainingDays} 天
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

  // 未验证：显示验证码输入墙
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      <div className="flex gap-4 mb-6">
        <span className="text-4xl">🎂</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-pink-600 mb-2 text-center"
          style={{ fontFamily: 'var(--font-display)' }}>
        🎂 专属生日贺卡
      </h1>

      <p className="text-sm text-pink-400 mb-8 text-center">
        请输入验证码开始使用
      </p>

      <div className="w-full max-w-xs space-y-4">
        <input
          type="text"
          value={inputCode}
          onChange={e => { setInputCode(e.target.value.toUpperCase()); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="请输入6位验证码"
          maxLength={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white focus:outline-none focus:border-pink-400 transition-all text-center text-lg tracking-[0.3em] font-mono"
        />

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          验证
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        没有验证码？请联系卖家获取
      </p>
    </div>
  )
}
