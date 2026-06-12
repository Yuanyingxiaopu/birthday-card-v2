import { useRef, useEffect } from 'react'
import { getTheme } from '../lib/theme'

export default function PasswordInput({ value, onChange, shake, themeId }) {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const digits = (value || '').split('')
  const t = getTheme(themeId)

  useEffect(() => { refs[0].current?.focus() }, [])

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const digit = raw.slice(-1)
    if (digit) {
      const newVal = digits.slice()
      newVal[index] = digit
      onChange(newVal.join(''))
      if (index < 3) refs[index + 1].current?.focus()
    } else {
      const newVal = digits.slice()
      newVal[index] = ''
      onChange(newVal.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newVal = digits.slice()
        newVal[index - 1] = ''
        onChange(newVal.join(''))
        refs[index - 1].current?.focus()
        e.preventDefault()
      }
    }
  }

  return (
    <div className={`flex gap-3 justify-center mb-4 ${shake ? 'animate-[shake_0.5s]' : ''}`}>
      {[0, 1, 2, 3].map(i => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold outline-none transition-all duration-150 select-none"
          style={{
            borderColor: digits[i] ? t.primary : t.border,
            backgroundColor: digits[i] ? t.primary + '12' : '#ffffffcc',
            color: t.primary,
          }}
        />
      ))}
    </div>
  )
}
