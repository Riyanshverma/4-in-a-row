import { SoundManagerProvider } from "@/components/shared/SoundManager"
import { Navbar } from "@/components/landing/navbar/Navbar"
import { HeroSection } from "@/components/landing/hero/HeroSection"
import { FeaturesSection } from "@/components/landing/features/FeaturesSection"
import { HowToPlaySection } from "@/components/landing/how-to-play/HowToPlaySection"
import { GameModesSection } from "@/components/landing/game-modes/GameModesSection"
import { StatisticsSection } from "@/components/landing/statistics/StatisticsSection"
import { LeaderboardPreviewSection } from "@/components/landing/leaderboard-preview/LeaderboardPreviewSection"
import { FAQSection } from "@/components/landing/faq/FAQSection"
import { Footer } from "@/components/landing/footer/Footer"

export function Landing() {
  return (
    <SoundManagerProvider>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowToPlaySection />
        <GameModesSection />
        <StatisticsSection />
        <LeaderboardPreviewSection />
        <FAQSection />
      </main>
      <Footer />
    </SoundManagerProvider>
  )
}
