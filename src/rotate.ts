import { State } from "./app";


export type Pos = {
  x: number
  y: number
}

interface MapState {
  crab: Pos
  coco: Pos
  tiles: Array<Array<number>>
}

export function rotate({ crab, coco, tiles }: MapState): MapState {
  const inv = new Array(tiles[0].length).fill(null).map(() => new Array(tiles.length).fill(null))

  for (let i = 0; i < tiles.length; i++) {
    const row = tiles[i]
    for (let j = 0; j < row.length; j++) {
      inv[j][i] = tiles[i][j]
    }
  }

  return {
    crab: { x: crab.y, y: crab.x },
    coco: { x: coco.y, y: coco.x },
    tiles: inv
  }
}
