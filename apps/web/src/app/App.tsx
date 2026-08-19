import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Landing } from "@/pages/landing/Landing"
import { ChooseGame } from "@/pages/choose-game/ChooseGame"
import { PlayWithBot } from "@/pages/play-with-bot/PlayWithBot"
import { PlayWithFriends } from "@/pages/play-with-friends/PlayWithFriends"
import { PlayWithPlayer } from "@/pages/play-with-player/PlayWithPlayer"
import { Play } from "@/pages/play/Play"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/choose-game" element={<ChooseGame />} />
        <Route path="/play-with-bot" element={<PlayWithBot />} />
        <Route path="/play-with-friends" element={<PlayWithFriends />} />
        <Route path="/play-with-player" element={<PlayWithPlayer />} />
        <Route path="/play" element={<Play />} />
      </Routes>
    </BrowserRouter>
  )
}
