const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  delay: `${(index % 7) * 0.35}s`,
}))

export default function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
        />
      ))}
    </div>
  )
}
