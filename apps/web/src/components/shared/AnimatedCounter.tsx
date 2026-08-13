import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"
import { cn } from "@workspace/ui/lib/utils"

interface AnimatedCounterProps {
  value: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, suffix = "", className }: AnimatedCounterProps) {
  const { value: displayValue, ref } = useAnimatedCounter(value)

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cn("font-mono tabular-nums", className)}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}
