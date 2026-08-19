import { Link } from "react-router-dom"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Bot, Users, Swords } from "@workspace/ui/icons"
import { GAME_MODES } from "@/lib/landing-data"

const MODE_ICONS = {
  single: Bot,
  friends: Users,
  multiplayer: Swords,
} as const

export function ChooseGame() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-4xl text-foreground md:text-5xl">Choose your game</h1>
        <p className="text-muted-foreground">Pick how you want to play.</p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {(Object.keys(GAME_MODES) as (keyof typeof GAME_MODES)[]).map((key) => {
          const mode = GAME_MODES[key]
          const Icon = MODE_ICONS[key]
          return (
            <Link key={key} to={mode.href}>
              <Card className="gap-4 p-2 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <Icon className="size-8 text-secondary" strokeWidth={2} />
                  <CardTitle className="font-heading text-2xl">{mode.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {mode.badge}
                  </Badge>
                  <CardDescription className="leading-relaxed">{mode.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
