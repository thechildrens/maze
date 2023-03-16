import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Editor from 'react-simple-code-editor';
import Sprites from './sprites.png'
import './app.css'
import { Grid } from './grid';

const WALLS = [
  [9, 5, 1, 3],
  [10, 15, 8, 2],
  [8, 1, 0, 2],
  [12, 4, 4, 6],
]

type Pos = {
  x: number
  y: number
}

type State = {
  line: number
  crab: Pos
  coco: Pos
  text: string
  answer: number
  went: Array<number>
  back: Array<number>
  tiles: Array<Array<number>>
}


function parseLine(line: string) {
  let branch = ''
  if (line.startsWith('+')) {
    branch = '+'
    line = line.slice(1)
  }
  else if (line.startsWith('-')) {
    branch = '-'
    line = line.slice(1)
  }

  const parsed = line.split(' ')
  parsed.push(branch)
  return parsed
}

// Todo: memo last
function parseText(text: string) {
  return text.split('\n').map(parseLine)
}

const WALLCHECKS: { [k: string]: number } = {
  up: 0b0001,
  right: 0b0010,
  down: 0b0100,
  left: 0b1000,
}

function pos2num(p: Pos): number {
  return (p.y << 8) + p.x
}

const XPOW = 2 ^ 8 - 1

function num2pos(n: number): Pos {
  return { x: n & XPOW, y: n >> 8 }
}

function reducer(state: State, action: any): State {
  switch (action.type) {
    case 'edit':
      return {
        ...state,
        line: -1,
        crab: INIT.crab,
        text: action.text,
      }
    case 'reset':
      return {
        ...state,
        line: -1,
        crab: INIT.crab,
      }
    case 'step':
      const text = parseText(state.text.trim())
      const line = text[state.line]
      if (line == null) return {
        ...state,
        line: state.line + 1
      }

      let change = {}
      let where
      let pnum: number
      const walls = state.tiles[state.crab.y][state.crab.x]

      const vars: { [k: string]: Pos } = {
        here: state.crab,
        up: { x: state.crab.x, y: state.crab.y - 1 },
        down: { x: state.crab.x, y: state.crab.y + 1 },
        left: { x: state.crab.x - 1, y: state.crab.y },
        right: { x: state.crab.x + 1, y: state.crab.y },
      }

      switch (line[0]) {
        case 'go':
          switch (line[1]) {
            case 'back':
              let last = state.back.pop()
              if (last == null) {
                change = {
                  answer: 1
                }
              } else {
                change = {
                  back: [...state.back]
                }
              }
              break
            default:
              const dir = line[1]
              if (walls & WALLCHECKS[dir]) {
                change = {
                  answer: 1
                }
              } else {
                change = {
                  crab: vars[dir]
                }
              }
          }
          break
        case 'went':
          where = vars[line[1]]
          pnum = pos2num(where)

          change = {
            went: [...state.went, pnum],
            back: [...state.back, pnum]
          }
          break
        case 'went?':
          where = vars[line[1]]
          pnum = pos2num(where)

          change = {
            answer: state.went.findIndex(n => n === pnum) === -1 ? 1 : 0
          }
          break
      }

      return {
        ...state,
        line: (state.line + 1) % text.length,
        answer: 0,
        ...change,
      }
  }

  return state
}

const INIT: State = {
  line: -1,
  crab: { x: 0, y: 0 },
  coco: { x: 3, y: 0 },
  answer: 0,
  went: [],
  back: [],
  tiles: WALLS,
  text: ''
}

const GRID_PX = 38

function App() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const [intv, setIntv] = useState(0 as any)

  const handleInput = useCallback((val: any) => {
    dispatch({ type: 'edit', text: val })
  }, [dispatch])

  const reset = useCallback(() => {
    if (intv !== 0) return
    dispatch({ type: 'reset' })
  }, [])

  const stepNext = useCallback(() => {
    if (intv !== 0) return
    dispatch({ type: 'step' })
  }, [dispatch])

  const stopPlay = useCallback(() => {
    if (intv) {
      clearInterval(intv)
      setIntv(0)
    }
  }, [intv, setIntv])

  const startPlay = useCallback(() => {
    if (intv !== 0) return
    const interval = setInterval(() => {
      dispatch({ type: 'step' })
    }, 1000)
    setIntv(interval)
  }, [intv, setIntv, dispatch])

  return (
    <>
      <div className="app">
        <div className="grid-container">
          <div className="avatar coco" style={{
            background: `url(${Sprites}) no-repeat -32px 0`,
            width: 32,
            height: 32,
            transform: `translate(${state.coco.x * GRID_PX + 4}px, ${state.coco.y * GRID_PX + 4}px)`
          }} />
          <div className="avatar crab" style={{
            background: `url(${Sprites}) no-repeat`,
            width: 32,
            height: 32,
            transform: `translate(${state.crab.x * GRID_PX + 4}px, ${state.crab.y * GRID_PX + 4}px)`
          }} />
          <Grid walls={state.tiles} />
        </div>
      </div>
      <div className="program">
        <div className="execution">
          <button className="reset" onClick={reset}>RESET</button>
          <button className="pause" onClick={stopPlay}>PAUSE</button>
          <button className="step" onClick={stepNext}>STEP</button>
          <button className="play" onClick={startPlay}>PLAY</button>
        </div>
        <div className="lines">
          <Editor
            className="editor"
            value={state.text}
            onValueChange={handleInput}
            highlight={text => {
              let lis: Array<string> = text.split('\n')
              lis = lis.map((row, i) => {
                return `<span class="line ${i === state.line ? 'active-line' : ''}">${row}</span>`
              })
              return lis.join('\n')
            }}
          />
        </div>
      </div>
    </>
  )
}

export default App;
