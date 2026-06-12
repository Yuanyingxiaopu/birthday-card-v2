import { useState, useEffect, useRef, useCallback } from 'react'
import { generateBirthdayMusic } from '../lib/audio'

// Global singleton so any click can trigger play
let globalAudio = null
let globalMusicUrl = null
let globalStarted = false

export function tryStartMusic() {
  if (globalStarted && globalAudio) {
    globalAudio.play().catch(() => {})
    return
  }
  if (!globalMusicUrl) {
    globalMusicUrl = generateBirthdayMusic()
  }
  if (!globalAudio) {
    globalAudio = new Audio(globalMusicUrl)
    globalAudio.loop = true
    globalAudio.volume = 0.7
    globalStarted = true
  }
  globalAudio.play().catch(() => {})
}

export default function BackgroundMusic() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = globalAudio

    const checkPlaying = setInterval(() => {
      if (globalAudio && !globalAudio.paused) {
        setPlaying(true)
      }
    }, 500)

    return () => clearInterval(checkPlaying)
  }, [])

  const toggleMusic = useCallback(() => {
    if (!globalAudio) {
      tryStartMusic()
      setPlaying(true)
      return
    }
    if (globalAudio.paused) {
      globalAudio.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      globalAudio.pause()
      setPlaying(false)
    }
  }, [])

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-pink-500/90
        text-white text-xl flex items-center justify-center shadow-lg
        active:scale-95 transition-all duration-200 hover:bg-pink-600"
      title={playing ? '暂停音乐' : '播放音乐'}
    >
      {playing ? '🎵' : '🔇'}
    </button>
  )
}
