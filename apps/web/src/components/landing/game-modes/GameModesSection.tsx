import { Badge } from "@workspace/ui/components/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Swords, Bot } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { GAME_MODES } from "@/lib/landing-data"

export function GameModesSection() {
  const {
    ref: pvpRef,
    className: pvpRevealClassName,
    style: pvpRevealStyle,
  } = useScrollReveal<HTMLDivElement>({ index: 0 })
  const {
    ref: botRef,
    className: botRevealClassName,
    style: botRevealStyle,
  } = useScrollReveal<HTMLDivElement>({ index: 1 })

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Game modes" title="Play your way" />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          ref={pvpRef}
          style={pvpRevealStyle}
          className={cn(
            "gap-4 p-2 transition-transform hover:-translate-y-0.5 hover:shadow-md",
            pvpRevealClassName
          )}
        >
          <CardHeader>
            <Swords className="size-8 text-secondary" strokeWidth={2} />
            <CardTitle className="font-heading text-2xl">{GAME_MODES.pvp.title}</CardTitle>
            <Badge variant="secondary" className="w-fit rounded-full">
              {GAME_MODES.pvp.badge}
            </Badge>
            <CardDescription className="leading-relaxed">{GAME_MODES.pvp.description}</CardDescription>
          </CardHeader>
        </Card>

        <Card
          ref={botRef}
          style={botRevealStyle}
          className={cn(
            "gap-4 p-2 transition-transform hover:-translate-y-0.5 hover:shadow-md",
            botRevealClassName
          )}
        >
          <CardHeader>
            <Bot className="size-8 text-secondary" strokeWidth={2} />
            <CardTitle className="font-heading text-2xl">{GAME_MODES.bot.title}</CardTitle>
            <Badge variant="secondary" className="w-fit rounded-full">
              {GAME_MODES.bot.badge}
            </Badge>
            <CardDescription className="leading-relaxed">{GAME_MODES.bot.description}</CardDescription>
            <div className="flex gap-2 pt-2">
              {GAME_MODES.bot.difficulties.map((d) => (
                <Badge key={d} variant="outline" className="rounded-full font-mono">
                  {d}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}
