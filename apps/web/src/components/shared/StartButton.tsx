import type { ComponentProps } from "react"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

interface StartButtonProps extends Omit<ComponentProps<typeof Button>, "size"> {
  children: React.ReactNode
}

export function StartButton({ children, className, ...props }: StartButtonProps) {
  return (
    <Button size="lg" className={cn("group/start", className)} {...props}>
      {children}
      <ArrowRight
        data-icon="inline-end"
        className="size-4 transition-transform group-hover/start:translate-x-0.5"
      />
    </Button>
  )
}
