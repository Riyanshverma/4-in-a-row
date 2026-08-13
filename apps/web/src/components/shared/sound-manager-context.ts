import { createContext, type RefObject } from "react"

export interface SoundManagerContextValue {
  hasInteracted: RefObject<boolean>
  markInteracted: () => void
}

export const SoundManagerContext = createContext<SoundManagerContextValue | null>(null)
