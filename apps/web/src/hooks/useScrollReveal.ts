import { useEffect, useRef, useState } from "react"

interface UseScrollRevealOptions {
  /** Index of this item within its stagger group; each step adds ~60ms of delay. */
  index?: number
}

export function useScrollReveal<T extends HTMLElement>({ index = 0 }: UseScrollRevealOptions = {}) {
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState<boolean>(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(true)
        observer.disconnect()
      }, { threshold: 0.2 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const delayMs = Math.min(index * 60, 60 * 8)

  return {
    ref,
    className: revealed ? "animate-card-reveal" : "opacity-0",
    style: { animationDelay: revealed ? `${delayMs}ms` : undefined },
  }
}
