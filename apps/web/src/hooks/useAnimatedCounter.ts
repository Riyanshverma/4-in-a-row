import { useEffect, useRef, useState } from "react"

interface UseAnimatedCounterOptions {
  duration?: number
  startOnView?: boolean
}

export function useAnimatedCounter(
  target: number,
  { duration = 1200, startOnView = true }: UseAnimatedCounterOptions = {}
) {
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [value, setValue] = useState(startOnView && !prefersReducedMotion ? 0 : target)
  const ref = useRef<HTMLElement | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!startOnView || prefersReducedMotion) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(target * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, duration, startOnView, prefersReducedMotion])

  return { value, ref }
}
