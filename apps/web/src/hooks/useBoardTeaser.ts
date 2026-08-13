import { useCallback, useState } from "react"

type Cell = "red" | "yellow" | null
type Board = Cell[][]

function emptyBoard(): Board {
  return Array.from({ length: 6 }, () => Array<Cell>(7).fill(null))
}

export function useBoardTeaser() {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [nextColor, setNextColor] = useState<"red" | "yellow">("red")
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  const dropDisc = useCallback(
    (col: number) => {
      setBoard((prev) => {
        const columnCells = prev.map((row) => row[col])
        const targetRow = columnCells.lastIndexOf(null)
        if (targetRow === -1) return prev

        const next = prev.map((row) => [...row])
        next[targetRow][col] = nextColor
        return next
      })

      setNextColor((c) => (c === "red" ? "yellow" : "red"))
    },
    [nextColor]
  )

  const reset = useCallback(() => {
    setBoard(emptyBoard())
    setNextColor("red")
  }, [])

  return { board, nextColor, hoverCol, setHoverCol, dropDisc, reset }
}
