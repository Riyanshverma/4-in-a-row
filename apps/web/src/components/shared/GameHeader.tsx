import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { LogoMark } from "@/assets/icons/logo-mark"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

interface GameHeaderProps {
  backTo: string
  backLabel?: string
}

export function GameHeader({ backTo, backLabel = "Go Back" }: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="size-8" />
          <span className="font-heading text-lg text-foreground">4 in a Row</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            className={cn("group/goback")}
            render={<Link to={backTo} />}
          >
            <ArrowLeft
              data-icon="inline-start"
              className="size-4 transition-transform group-hover/goback:-translate-x-0.5"
            />
            {backLabel}
          </Button>
        </div>
      </div>
    </header>
  )
}
