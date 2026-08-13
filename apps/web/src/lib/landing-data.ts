import {
  Activity,
  Bot,
  Clock,
  Gamepad2,
  Grid3x3,
  Lightbulb,
  MousePointerClick,
  Repeat,
  Sparkles,
  Timer,
  Trophy,
  Users,
  UserPlus,
  Wifi,
  Zap,
} from "@workspace/ui/icons"
import type { ComponentType, SVGProps } from "react"

export interface Feature {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  large?: boolean
}

export const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "Real-Time Play",
    description:
      "Every move syncs instantly over WebSockets — no polling, no lag, no refresh. Watch your opponent's disc drop the moment they click.",
    large: true,
  },
  {
    icon: Bot,
    title: "Bot Fallback",
    description: "No human opponent available? Play instantly against a bot at your chosen difficulty.",
  },
  {
    icon: Wifi,
    title: "Reconnection",
    description: "Drop your connection mid-match? You've got 30 seconds to rejoin without losing your seat.",
  },
  {
    icon: Activity,
    title: "Live State",
    description: "The board you see is always the server's board — no desyncs, no optimistic-update bugs.",
  },
  {
    icon: Timer,
    title: "Move Timer",
    description: "A visible 30-second clock keeps every match moving at a fair, predictable pace.",
  },
  {
    icon: Repeat,
    title: "Replay",
    description: "Review how a match played out move-by-move after it ends.",
    
  },
  {
    icon: Sparkles,
    title: "AI Hints",
    description:"Stuck? Ask for a hint and get a suggested move from an AI assistant that explains its reasoning, not just the answer.",
    large: true,
  },
]

export interface Step {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  step: number
  title: string
  description: string
}

export const STEPS: Step[] = [
  {
    icon: UserPlus,
    step: 1,
    title: "Enter a username",
    description: "No account required — just pick a name and you're in the queue.",
  },
  {
    icon: MousePointerClick,
    step: 2,
    title: "Drop discs",
    description: "Click a column to drop your disc. Turns alternate automatically.",
  },
  {
    icon: Grid3x3,
    step: 3,
    title: "Connect four",
    description: "Line up four discs — horizontally, vertically, or diagonally — to win.",
  },
  {
    icon: Trophy,
    step: 4,
    title: "Climb the board",
    description: "Wins push you up the leaderboard. Track your rank after every match.",
  },
]

export interface GameMode {
  title: string
  description: string
  badge: string
}

export const GAME_MODES: { pvp: GameMode; bot: GameMode & { difficulties: string[] } } = {
  pvp: {
    title: "Player vs Player",
    description: "Get matched with another live player and race to four in a row in real time.",
    badge: "Live",
  },
  bot: {
    title: "Player vs Bot",
    description: "No opponent online? Play an AI bot instantly, tuned to your preferred difficulty.",
    badge: "Instant",
    difficulties: ["Easy", "Medium", "Hard"],
  },
}

export interface Stat {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: number
  suffix?: string
}

export const STATS: Stat[] = [
  { icon: Gamepad2, label: "Games Played", value: 128430 },
  { icon: Users, label: "Active Players", value: 3214 },
  { icon: Clock, label: "Avg Move Time", value: 4, suffix: "s" },
  { icon: Lightbulb, label: "AI Hints Given", value: 52890 },
]

export interface LeaderboardEntry {
  rank: number
  name: string
  wins: number
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "vortex_king", wins: 342 },
  { rank: 2, name: "discmaster", wins: 318 },
  { rank: 3, name: "quietstorm", wins: 297 },
  { rank: 4, name: "n4rw40l", wins: 281 },
  { rank: 5, name: "playfour", wins: 265 },
]

export interface FAQItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Do I need to make an account?",
    answer: "No. Enter a username and you're straight into the queue. Accounts may come later, but they're not required to play.",
  },
  {
    question: "What happens if I lose connection mid-game?",
    answer: "You have 30 seconds to reconnect and resume exactly where you left off — the server holds your seat.",
  },
  {
    question: "How does the AI opponent work?",
    answer: "The bot plays at three difficulty levels you choose before queueing. It's a separate system from the in-match AI hints, which are available regardless of who your opponent is.",
  },
  {
    question: "Is this free to play?",
    answer: "Yes, fully free — no purchases, no ads blocking gameplay.",
  },
]

export const FOOTER_LINKS = [
  { label: "How to Play", href: "#how-to-play" },
  { label: "Leaderboard", href: "#leaderboard" },
]
