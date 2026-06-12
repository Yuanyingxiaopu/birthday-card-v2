import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  '正在查询生日资料...',
  '正在生成生日密码...',
  '正在匹配生日祝福...',
  '正在绘制生日贺卡...',
  '即将完成...',
]

export default function GeneratingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const cardData = sessionStorage.getItem('card_data')
    if (!cardData) {
      navigate('/')
      return
    }

    const totalDuration = 4000
    const stepInterval = totalDuration / STEPS.length
    const progressInterval = 50
    const progressStep = 100 / (totalDuration / progressInterval)

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev + progressStep
        return next >= 100 ? 100 : next
      })
    }, progressInterval)

    const stepTimer = setInterval(() => {
      setStepIndex(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepTimer)
          clearInterval(progressTimer)
          setProgress(100)
          setTimeout(() => {
            const data = JSON.parse(cardData)
            navigate(`/card/${data.id}`)
          }, 600)
          return prev
        }
        return prev + 1
      })
    }, stepInterval)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
    }
  }, [navigate])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      {/* Spinning cake */}
      <div className="text-7xl mb-8 animate-bounce">🎂</div>

      {/* Step text */}
      <div className="h-8 mb-6">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className={`text-base font-medium transition-all duration-300 ${
              i === stepIndex ? 'text-pink-600 opacity-100' : i < stepIndex ? 'text-pink-300 opacity-60' : 'opacity-0'
            }`}
          >
            {i === stepIndex && '✨ '}{step}
          </p>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2.5 bg-pink-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-pink-400">{Math.round(progress)}%</p>
    </div>
  )
}
