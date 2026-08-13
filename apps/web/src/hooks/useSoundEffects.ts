import { useCallback, useContext, useRef } from "react"
import { SoundManagerContext } from "@/components/shared/sound-manager-context"

export function useSoundManager() {
  const ctx = useContext(SoundManagerContext)
  if (!ctx) throw new Error("useSoundManager must be used within SoundManagerProvider")
  return ctx
}

export function useSoundEffects() {
  const { hasInteracted, markInteracted } = useSoundManager()
  const contextRef = useRef<AudioContext | null>(null)

  const play = useCallback(() => {
    if (!hasInteracted.current) return

    if (!contextRef.current) {
      contextRef.current = new AudioContext()
    }
    const ctx = contextRef.current
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = "sine"
    oscillator.frequency.value = 220
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.15)
  }, [hasInteracted])

  return { play, markInteracted }
}
