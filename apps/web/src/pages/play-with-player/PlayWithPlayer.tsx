import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { Search } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Footer } from "@/components/landing/footer/Footer"
import { GameHeader } from "@/components/shared/GameHeader"

const SEARCH_DURATION_MS = 60_000

export function PlayWithPlayer() {
  const navigate = useNavigate()
  const [elapsedMs, setElapsedMs] = useState<number>(0)
  const [matchFound, setMatchFound] = useState<boolean>(false)
  const startRef = useRef<number>(0)

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    startRef.current = Date.now()

    const intervalId = window.setInterval(() => {
      const elapsed = Math.min(Date.now() - startRef.current, SEARCH_DURATION_MS)
      setElapsedMs(elapsed)
    }, 200)

    const timeoutId = window.setTimeout(() => {
      setMatchFound(true)
    }, SEARCH_DURATION_MS)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!matchFound) return
    const navTimeoutId = window.setTimeout(() => {
      navigate("/play", { state: { mode: "bot", difficulty: "medium", matchedVia: "timeout" } })
    }, 600)
    return () => window.clearTimeout(navTimeoutId)
  }, [matchFound, navigate])

  const progressValue = Math.min((elapsedMs / SEARCH_DURATION_MS) * 100, 100)
  const secondsRemaining = Math.max(0, Math.ceil((SEARCH_DURATION_MS - elapsedMs) / 1000))

  return (
    <div className="flex min-h-svh flex-col">
      <GameHeader backTo="/choose-game" />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading text-3xl text-foreground md:text-4xl">
            {matchFound ? "Match found — connecting…" : "Finding an opponent…"}
          </h1>
          <p className="text-muted-foreground">
            {matchFound
              ? "Get ready — the match is starting."
              : "Hang tight while we look for another player. If nobody joins in time, you'll be matched with a bot."}
          </p>
        </div>

        <Search
          aria-hidden="true"
          className={cn(
            "size-20 text-secondary",
            !matchFound && !prefersReducedMotion && "animate-spin"
          )}
        />

        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          <Progress value={progressValue} className="w-full" />
          <span className="font-mono text-sm text-muted-foreground">
            {matchFound ? "0:00" : `0:${secondsRemaining.toString().padStart(2, "0")}`} remaining
          </span>
        </div>

        <Button
          size="lg"
          className={cn("group/cancel")}
          onClick={() => navigate("/choose-game")}
          disabled={matchFound}
        >
          Cancel search
        </Button>
      </main>

      <Footer />
    </div>
  )
}
