import type { ComponentType, SVGProps } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Bot, Swords, Users } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { GAME_MODES } from "@/lib/landing-data"

function ModeCard({ modeKey, icon: Icon, index }: { modeKey: keyof typeof GAME_MODES, icon: ComponentType<SVGProps<SVGSVGElement>>, index: number }) {
  const { ref, className: revealClassName, style: revealStyle } = useScrollReveal<HTMLDivElement>({ index })
  const mode = GAME_MODES[modeKey]

  return (
    <Card
      ref={ref}
      style={revealStyle}
      className={cn(
        "gap-4 p-2 transition-transform hover:-translate-y-0.5 hover:shadow-md",
        revealClassName
      )}
    >
      <CardHeader>
        <Icon className="size-8 text-secondary" strokeWidth={2} />
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
  )
}

export function GameModesSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Game modes" title="Play your way" />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { key: "single" as const, icon: Bot },
          { key: "friends" as const, icon: Users },
          { key: "multiplayer" as const, icon: Swords },
        ].map((m, index) => (
          <ModeCard key={m.key} modeKey={m.key} icon={m.icon} index={index} />
        ))}
      </div>
    </section>
  )
}
