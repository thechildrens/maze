import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Editor from 'react-simple-code-editor';
import Sprites from './sprites.png'
import './app.css'
import { Grid } from './grid';
import { useCustomReducer } from './reducer';
import { Lose, Win } from './win';
import { Tutorial, TutorialIcon } from './tutorial';
import { useLocalStorage } from './use-local';
import { LEVELS } from './levels';
import { Pos, rotate } from './rotate';

export type State = {
  line: number
  crab: Pos
  coco: Pos
  text: string
  result: number
  went: Array<number>
  back: Array<number>
  win: boolean
  cooked: boolean
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

function pos2num(p: Pos): number {
  return (p.y << 8) + p.x
}

const XPOW = 2 ** 8 - 1

function num2pos(n: number): Pos {
  return { x: n & XPOW, y: n >> 8 }
}

function reducer(state: State, action: any): State {
  switch (action.type) {
    case '@SETLEVEL':
      Object.assign(INIT, action.data)
      return { ...INIT, text: state.text }
    case '@REWIND':
      return action.lastState
    case 'edit':
      return {
        ...state,
        line: -1,
        went: [],
        back: [],
        cooked: false,
        crab: INIT.crab,
        coco: INIT.coco,
        tiles: INIT.tiles,
        text: action.text,
      }
    case 'reset':
      return {
        ...state,
        went: [],
        back: [],
        line: -1,
        cooked: false,
        crab: INIT.crab,
        coco: INIT.coco,
        tiles: INIT.tiles,
      }
    case 'step':
      if (state.win) return state

      const trimmed = state.text.trim()
      const text = parseText(trimmed)
      const nextline = (state.line + 1) % text.length
      if (state.line === -1) {
        if (Math.random() < 0.5) {
          return {
            ...state,
            ...rotate(state),
            line: nextline,
            result: -1,
          }
        }

        return {
          ...state,
          line: nextline,
          result: -1,
        }
      }

      const line = text[state.line]
      if (line == null) return {
        ...state,
        line: nextline,
        result: -1
      }

      const rail = line[line.length - 1]
      if (rail === '+' && state.result < 0) {
        return {
          ...state,
          line: nextline,
          result: 0
        }
      }
      if (rail === '-' && state.result > -1) {
        return {
          ...state,
          line: nextline,
          result: 0
        }
      }

      let change = {}
      let where
      let pnum: number

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
              let [last] = state.back.slice(-1)
              if (last == null) {
                change = {
                  result: -1
                }
              } else {
                change = {
                  result: 1,
                  back: state.back.slice(0, -1),
                  crab: num2pos(last)
                }
              }
              break
            default:
              const dir = vars[line[1]]
              if (
                dir.y < 0 || dir.x < 0
                || dir.y >= state.tiles.length
                || dir.x >= state.tiles[0].length
              ) {
                change = {
                  result: -1
                }
              } else {
                const tile = state.tiles[dir.y][dir.x]
                if (tile > 0 && tile < 3) {
                  change = {
                    result: -1
                  }
                } else {
                  const went = [...state.went]
                  pnum = pos2num(vars.here)
                  if (went.findIndex(n => n === pnum) === -1) went.push(pnum)
                  change = {
                    crab: dir,
                    went,
                    win: pos2num(dir) === pos2num(state.coco),
                    cooked: tile === 3,
                    back: [...state.back, pnum]
                  }
                }
              }
          }
          break
        // case 'went':
        //   where = vars[line[1]]
        //   pnum = pos2num(where)

        //   change = {
        //     went: [...state.went, pnum],
        //     back: [...state.back, pnum]
        //   }
        //   break
        case 'went?':
          where = vars[line[1]]
          pnum = pos2num(where)

          change = {
            result: state.went.findIndex(n => n === pnum)
          }
          break
      }

      return {
        ...state,
        text: trimmed,
        line: nextline,
        result: 0,
        ...change,
      }
  }

  return state
}

const INIT: State = {
  line: -1,
  result: 0,
  went: [],
  back: [],
  win: false,
  cooked: false,
  crab: { x: 0, y: 0 },
  coco: { x: 0, y: 0 },
  tiles: [],
  text: ''
}

const GRID_PX = 38

function App() {
  const [progress, setProgress] = useState({ level: 0 })
  const [state, dispatch] = useCustomReducer(reducer, INIT)
  const [showTut, setShowTut] = useState(false)
  const [intv, setIntv] = useState(0 as any)

  // set level
  useEffect(() => {
    dispatch({ type: '@SETLEVEL', data: LEVELS[progress.level] })
  }, [progress.level])

  const stopPlay = useCallback(() => {
    if (intv) {
      clearInterval(intv)
      setIntv(0)
    }
  }, [intv, setIntv])

  // stop if cooked or win
  useEffect(() => {
    if (intv && (state.win || state.cooked)) {
      clearInterval(intv)
      setIntv(0)
    }
  }, [state.cooked, state.win])

  const nextLevel = useCallback(() => {
    stopPlay()
    setProgress(p => ({ level: p.level + 1 }))
  }, [setProgress, stopPlay])

  const handleInput = useCallback((val: any) => {
    stopPlay()
    dispatch({ type: 'edit', text: val })
  }, [stopPlay])

  const reset = useCallback(() => {
    stopPlay()
    dispatch({ type: 'reset' })
  }, [stopPlay])

  const stepBack = useCallback(() => {
    if (intv !== 0) return
    dispatch({ type: '@REWIND' })
  }, [intv])

  const stepNext = useCallback(() => {
    if (intv !== 0) return
    dispatch({ type: 'step' })
  }, [intv])

  const startPlay = useCallback(() => {
    if (intv !== 0) return
    const interval = setInterval(function () {
      dispatch({ type: 'step' })
    }, 1000)
    setIntv(interval)
  }, [intv, setIntv])

  const clickTut = useCallback(() => {
    setShowTut(true)
  }, [setShowTut])

  const exitTut = useCallback(() => {
    setShowTut(false)
  }, [setShowTut])


  return (
    <>
      {state.cooked && <Lose restart={reset} />}
      {state.win && <Win goNext={nextLevel} />}
      {showTut && <Tutorial onClose={exitTut} />}
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
          <Grid tiles={state.tiles} />
        </div>
      </div>
      <div className="program">
        <div className="execution">
          <button className="reset" onClick={reset}>NEW</button>
          <button className="pause" onClick={stopPlay}>STOP</button>
          <button className="back" onClick={stepBack}>BACK</button>
          <button className="step" onClick={stepNext}>STEP</button>
          <button className="play" onClick={startPlay}>PLAY</button>
        </div>
        <div className="lines">
          <TutorialIcon onClick={clickTut} />
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
        <div className="debug">
          <div className="single-vars">
            <div>result: {state.result}</div>
            <div>crab: {displayPos(state.crab)}</div>
            <div>coco: {displayPos(state.coco)}</div>
          </div>
          <div>went: ...{state.went.slice(-5).map(num2pos).map(displayPos).join(' ')}</div>
          <div>back: ...{state.back.slice(-5).map(num2pos).map(displayPos).join('\n')}</div>
        </div>
      </div>
    </>
  )
}

function displayPos(p: Pos) {
  return `(${p.x},${p.y})`
}

export default App;
