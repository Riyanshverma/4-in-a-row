import { useRef, type ReactNode } from "react"
import { SoundManagerContext } from "@/components/shared/sound-manager-context"

export function SoundManagerProvider({ children }: { children: ReactNode }) {
  const hasInteracted = useRef<boolean>(false)

  const markInteracted = () => {
    hasInteracted.current = true
  }

  return (
    <SoundManagerContext.Provider value={{ hasInteracted, markInteracted }}>
      {children}
    </SoundManagerContext.Provider>
  )
}
