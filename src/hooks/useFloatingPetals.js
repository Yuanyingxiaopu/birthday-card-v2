import { useEffect, useState } from 'react'

const PETAL_EMOJIS = ['🌸', '🌺', '💮', '🏵️', '✿', '❀']

export default function useFloatingPetals(count = 15) {
  const [petals, setPetals] = useState([])

  useEffect(() => {
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
      left: Math.random() * 100,
      size: 12 + Math.random() * 16,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
    }))
    setPetals(items)
  }, [count])

  return petals
}
