import { Card } from "@workspace/ui/components/card"
import { Crown } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { LEADERBOARD } from "@/lib/landing-data"

export function LeaderboardPreviewSection() {
  return (
    <section id="leaderboard" className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Top players" title="Leaderboard" />

      <Card className="mx-auto mt-12 max-w-xl divide-y divide-border p-0">
        {LEADERBOARD.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full font-mono text-xs font-semibold",
                  entry.rank === 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {entry.rank === 1 ? <Crown className="size-3.5" /> : entry.rank}
              </span>
              <span className="font-medium text-foreground">{entry.name}</span>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{entry.wins} wins</span>
          </div>
        ))}
      </Card>
    </section>
  )
}
