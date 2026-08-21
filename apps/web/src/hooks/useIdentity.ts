import { useCallback, useState } from "react"

// TODO: Use zustand for storing the key-value pairs in localStorage instead of this custom hook. This will allow us to use the same state across multiple components without having to pass it down through props or context.

function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem("4iar-device-id")
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem("4iar-device-id", id)
  return id
}

export function useIdentity() {
  const [deviceId] = useState<string>(getOrCreateDeviceId)
  const [username, setUsernameState] = useState<string>(() => localStorage.getItem("4iar-username") ?? "")

  const setUsername = useCallback((name: string) => {
    setUsernameState(name)
    localStorage.setItem("4iar-username", name)
  }, [])

  return { deviceId, username, setUsername }
}
