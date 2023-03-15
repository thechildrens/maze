import { useReducer, useState } from "react"

type GridProps = {
  walls: Array<Array<number>>
}

export function Grid({ walls }: GridProps) {
  const [grid,] = useState(() => {
    return walls.map((row, i) =>
      <div className="grid-row" key={i}>
        {row.map((cell, j) =>
          <div className={`grid-cell walls-${walls[i][j]}`} key={j}>
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
