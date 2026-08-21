import type { ComponentType, SVGProps } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Bot, Swords, Users } from "@workspace/ui/icons"
import { Footer } from "@/components/landing/footer/Footer"
import { GameHeader } from "@/components/shared/GameHeader"
import { useIdentity } from "@/hooks/useIdentity"
import { GAME_MODES } from "@/lib/landing-data"

function ModeCard({
  modeKey,
  icon: Icon,
  index,
}: {
  modeKey: keyof typeof GAME_MODES
  icon: ComponentType<SVGProps<SVGSVGElement>>
  index: number
}) {
  const mode = GAME_MODES[modeKey]

  return (
    <Link
      // Every GAME_MODES entry sets href; this page only ever renders the three known modes.
      to={mode.href!}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full gap-4 border-2 border-border p-3 ring-0 transition-colors duration-200 ease-out hover:border-secondary hover:bg-accent/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Icon className="size-14 text-secondary" strokeWidth={2} />
            <span className="font-mono text-xs text-secondary">0{index + 1}</span>
          </div>
          <CardTitle className="font-heading text-2xl">{mode.title}</CardTitle>
          <Badge variant="secondary" className="w-fit rounded-full">
            {mode.badge}
          </Badge>
          <CardDescription className="leading-relaxed">{mode.description}</CardDescription>
          {mode.difficulties && (
            <div className="flex gap-2 pt-2">
              {mode.difficulties.map((d) => (
                <Badge key={d} variant="outline" className="rounded-full font-mono">
                  {d}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  )
}

export function ChooseGame() {
  const { username, setUsername } = useIdentity()

  return (
    <div className="flex min-h-svh flex-col">
      <GameHeader backTo="/" />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading text-3xl text-foreground md:text-4xl">Choose your game</h1>
          <p className="text-base text-muted-foreground">Pick a username, then pick how you want to play.</p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-2">
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="h-11"
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { key: "single" as const, icon: Bot },
            { key: "friends" as const, icon: Users },
            { key: "multiplayer" as const, icon: Swords },
          ].map((m, index) => (
            <ModeCard key={m.key} modeKey={m.key} icon={m.icon} index={index} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
