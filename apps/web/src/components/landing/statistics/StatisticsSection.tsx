import { Card } from "@workspace/ui/components/card"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { STATS } from "@/lib/landing-data"

export function StatisticsSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Live numbers" title="The board never sleeps" />

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="items-center gap-2 p-6 text-center">
            <stat.icon className="size-6 text-secondary" strokeWidth={2} />
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              className="text-3xl font-semibold text-foreground"
            />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </Card>
        ))}
      </div>
    </section>
  )
}
