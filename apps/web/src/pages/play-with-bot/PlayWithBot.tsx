import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Slider } from "@workspace/ui/components/slider"
import { Bot } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Footer } from "@/components/landing/footer/Footer"
import { GameHeader } from "@/components/shared/GameHeader"
import { StartButton } from "@/components/shared/StartButton"

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy", depth: 2 },
  { value: "medium", label: "Medium", depth: 5 },
  { value: "hard", label: "Hard", depth: 8 },
] as const

export function PlayWithBot() {
  const [levelIndex, setLevelIndex] = useState<number>(1)
  const navigate = useNavigate()
  const level = DIFFICULTY_LEVELS[levelIndex]!

  return (
    <div className="min-h-svh bg-background">
      <GameHeader backTo="/choose-game" />

      <main className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Badge variant="secondary" className="rounded-full">
              <Bot className="size-3.5" />
              Single Player
            </Badge>
            <h1 className="font-heading text-3xl text-foreground md:text-4xl">
              Choose your difficulty
            </h1>
            <p className="text-muted-foreground">
              Play against the built-in engine. Higher difficulty searches deeper.
            </p>
          </div>

          <Card className="w-full p-6">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-heading text-xl text-foreground">{level.label}</span>
              <span className="font-mono text-sm text-muted-foreground">
                · depth {level.depth}
              </span>
            </div>

            <div className="mt-6 px-2">
              <Slider
                min={0}
                max={DIFFICULTY_LEVELS.length - 1}
                step={1}
                value={[levelIndex]}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value
                  if (typeof next === "number") setLevelIndex(next)
                }}
                aria-label="Bot difficulty"
              />

              <div className="mt-4 flex justify-between">
                {DIFFICULTY_LEVELS.map((d, index) => (
                  <span
                    key={d.value}
                    className={cn(
                      "text-sm transition-colors",
                      index === levelIndex
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <StartButton
            onClick={() => navigate("/play", { state: { mode: "bot", difficulty: level.value } })}
          >
            Start Match
          </StartButton>
        </div>
      </main>

      <Footer />
    </div>
  )
}
