import { Link, useSearchParams } from 'react-router-dom'
import { tryStartMusic } from '../components/BackgroundMusic'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in-up">
      {/* Decorative balloons */}
      <div className="flex gap-6 mb-8">
        <span className="text-5xl balloon" style={{ animationDelay: '0s' }}>🎈</span>
        <span className="text-6xl balloon" style={{ animationDelay: '0.5s' }}>🎂</span>
        <span className="text-5xl balloon" style={{ animationDelay: '1s' }}>🎈</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-3 text-center"
          style={{ fontFamily: 'var(--font-display)' }}>
        🎂 专属生日贺卡
      </h1>

      <p className="text-base text-pink-400 mb-1 text-center">
        输入生日信息
      </p>
      <p className="text-sm text-pink-300 mb-8 text-center">
        生成属于你的专属生日祝福
      </p>

      {/* CTA Button */}
      <Link
        to={token ? `/form?token=${token}` : '/form'}
        onClick={tryStartMusic}
        className="animate-pulse-glow inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 no-underline"
      >
        <span>✨</span>
        立即开始
        <span>✨</span>
      </Link>

      {/* Feature hints */}
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
