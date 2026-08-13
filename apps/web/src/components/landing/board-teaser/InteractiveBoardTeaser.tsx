import { Button } from "@workspace/ui/components/button"
import { RotateCcw } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { useBoardTeaser } from "@/hooks/useBoardTeaser"
import { useSoundEffects } from "@/hooks/useSoundEffects"

export function InteractiveBoardTeaser() {
  const { board, hoverCol, setHoverCol, dropDisc, reset } = useBoardTeaser()
  const { play, markInteracted } = useSoundEffects()

  const handleDrop = (col: number) => {
    markInteracted()
    play()
    dropDisc(col)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">Try it out</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Reset board" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className="grid gap-1.5 rounded-md bg-board-blue p-3 shadow-md sm:gap-2 sm:p-4"
        style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}
      >
        {board.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              aria-label={`Drop disc in column ${colIndex + 1}`}
              onMouseEnter={() => setHoverCol(colIndex)}
              onMouseLeave={() => setHoverCol(null)}
              onClick={() => handleDrop(colIndex)}
              className={cn(
                "size-8 cursor-pointer rounded-full bg-background/20 transition-colors sm:size-10",
                hoverCol === colIndex && "bg-background/30",
                cell === "red" && "bg-primary",
                cell === "yellow" && "bg-secondary"
              )}
            />
          ))
        )}
      </div>
    </div>
  )
}
