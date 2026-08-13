import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

interface PlayNowButtonProps {
  className?: string
  size?: "default" | "lg"
}

export function PlayNowButton({ className, size = "default" }: PlayNowButtonProps) {
  return (
    <Button size={size} className={cn("group/play", className)}>
      Play Now
      <ArrowRight
        data-icon="inline-end"
        className="size-4 transition-transform group-hover/play:translate-x-0.5"
      />
    </Button>
  )
}
