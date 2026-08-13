import { Badge } from "@workspace/ui/components/badge"
import { PlayNowButton } from "@/components/shared/PlayNowButton"
import { InteractiveBoardTeaser } from "@/components/landing/board-teaser/InteractiveBoardTeaser"

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-24">
      <div className="flex max-w-xl flex-col items-start gap-6">
        <Badge variant="secondary" className="rounded-full">
          Real-time · No sign-up required
        </Badge>
        <h1 className="font-heading text-5xl leading-tight text-foreground md:text-6xl">
          Connect Four. Live. Competitive.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Drop into a match instantly, play against a friend or an AI opponent that adapts to your
          skill, and climb the leaderboard — all in your browser, no download required.
        </p>
        <PlayNowButton size="lg" />
      </div>

      <div className="flex w-full max-w-md justify-center">
        <InteractiveBoardTeaser />
      </div>
    </section>
  )
}
