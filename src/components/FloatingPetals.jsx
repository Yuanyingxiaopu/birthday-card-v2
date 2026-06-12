import useFloatingPetals from '../hooks/useFloatingPetals'

export default function FloatingPetals({ count = 15 }) {
  const petals = useFloatingPetals(count)

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map(p => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
