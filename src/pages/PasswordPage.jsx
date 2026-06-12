import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCardById } from '../lib/supabase'

export default function PasswordPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length !== 4) {
      setError('请输入4位密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Try local data first
      const localData = sessionStorage.getItem('card_data')
      if (localData) {
        const data = JSON.parse(localData)
        if (data.id == cardId && data.password === password) {
          navigate(`/card/${cardId}/view`)
          return
        }
      }

      // Try database
      const card = await getCardById(cardId)
      if (card && card.password === password) {
        navigate(`/card/${cardId}/view`)
      } else {
        setError('密码错误，请重新输入')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPassword(val)
    if (error) setError('')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      {/* Lock icon */}
      <div className="text-6xl mb-6">🔐</div>

      <h1 className="text-2xl font-bold text-pink-600 mb-2"
          style={{ fontFamily: 'var(--font-display)' }}>
        请输入生日密码
      </h1>

      <p className="text-sm text-pink-400 mb-2 text-center">
        密码为生日对应的<span className="font-semibold text-pink-600">阳历月日</span>
      </p>

      <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-6 text-sm text-pink-500 border border-pink-100 max-w-xs w-full">
        <p className="font-medium mb-1">例如：</p>
        <p>生日：2026-06-12</p>
        <p>密码：<span className="font-bold text-pink-600 tracking-widest">0612</span></p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className={`flex gap-3 justify-center mb-4 ${shake ? 'animate-[shake_0.5s]' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                password[i]
                  ? 'border-pink-400 bg-pink-50 text-pink-600'
                  : 'border-pink-200 bg-white/80 text-pink-300'
              } ${password.length === i ? 'border-pink-400 shadow-sm' : ''}`}
            >
              {password[i] || '·'}
            </div>
          ))}
        </div>

        <input
          type="text"
          inputMode="numeric"
          value={password}
          onChange={handleInput}
          className="absolute opacity-0 w-0 h-0"
          autoFocus
        />

        {error && (
          <p className="text-center text-sm text-red-400 mb-3 animate-fade-in-up">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || password.length < 4}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '验证中...' : '🔓 确认查看'}
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
