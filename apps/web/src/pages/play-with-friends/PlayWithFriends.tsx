import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Check, Copy } from "@workspace/ui/icons"
import { Footer } from "@/components/landing/footer/Footer"
import { GameHeader } from "@/components/shared/GameHeader"
import { StartButton } from "@/components/shared/StartButton"

const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function generateRoomCode() {
  return Array.from(
    { length: 6 },
    () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join("")
}

function RoomCodePanel({ onJoin }: { onJoin: (code: string) => void }) {
  const [code] = useState<string>(generateRoomCode)
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-muted/40 py-6">
        <span className="font-mono text-3xl tracking-widest text-foreground">{code}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Copy room code"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </Button>
      </div>

      <DialogFooter>
        <StartButton onClick={() => onJoin(code)}>Join Room</StartButton>
      </DialogFooter>
    </>
  )
}

function CreateRoomDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState<boolean>(false)

  const handleJoin = (code: string) => {
    navigate("/play", { state: { mode: "friends", code, role: "creator" } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<StartButton>Create Room</StartButton>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room created</DialogTitle>
          <DialogDescription>Share this code with a friend so they can join.</DialogDescription>
        </DialogHeader>

        {open && <RoomCodePanel onJoin={handleJoin} />}
      </DialogContent>
    </Dialog>
  )
}

export function PlayWithFriends() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState<string>("")

  return (
    <div className="flex min-h-svh flex-col">
      <GameHeader backTo="/choose-game" />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading text-3xl text-foreground md:text-4xl">Play with Friends</h1>
          <p className="text-muted-foreground">
            Create a room and share the code, or join a friend's room to play together.
          </p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="gap-4 p-3">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Join Room</CardTitle>
              <CardDescription>Enter a room code from a friend to join their game.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter room code"
                aria-label="Room code"
                className="h-11 font-mono uppercase tracking-widest"
              />
              <StartButton
                disabled={joinCode.trim().length === 0}
                onClick={() =>
                  navigate("/play", { state: { mode: "friends", code: joinCode.trim(), role: "guest" } })
                }
              >
                Join Room
              </StartButton>
            </CardContent>
          </Card>

          <Card className="gap-4 p-3">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Create Room</CardTitle>
              <CardDescription>Generate a room code and invite a friend to join.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRoomDialog />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
