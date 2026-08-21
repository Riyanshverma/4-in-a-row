import { useCallback, useEffect, useState } from "react"

// TODO: Use zustand for storing the key-value pairs in localStorage instead of this custom hook. This will allow us to use the same state across multiple components without having to pass it down through props or context.

type Theme = "dark" | "light"

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("4iar-theme")
  if (stored === "light" || stored === "dark") return stored
  return "dark"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("4iar-theme", theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  return { theme, toggleTheme }
}
