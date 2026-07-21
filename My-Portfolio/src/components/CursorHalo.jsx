import { useEffect, useRef } from 'react'

export default function CursorHalo() {
  const haloRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return undefined
    }

    const moveHalo = (event) => {
      haloRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`)
      haloRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`)
    }

    window.addEventListener('pointermove', moveHalo, { passive: true })
    return () => window.removeEventListener('pointermove', moveHalo)
  }, [])

  return <div ref={haloRef} className="cursor-halo" aria-hidden="true" />
}
