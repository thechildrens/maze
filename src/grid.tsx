import { useReducer, useState } from "react"
import './grid.css'

type GridProps = {
  tiles: Array<Array<number>>
}

export function Grid({ tiles }: GridProps) {
  const [grid,] = useState(() => {
    return tiles.map((row, i) =>
      <div className="grid-row" key={i}>
        {row.map((cell, j) =>
          <div className={`grid-cell tiles-${tiles[i][j]}`} key={j}>
            {j},{i}
          </div>
        )}
      </div>
    )
  })

  return (
    <div className='grid'>
      {grid}
    </div>
  )
}
