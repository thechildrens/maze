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
  tiles: Array<Array<number>>
}


// Todo: memo last
function parseText(text: string) {
  return text.split('\n')
}

function reducer(state: State, action: any): State {
  switch (action.type) {
    case 'edit':
      return {
        ...state,
        line: -1,
        text: action.text,
      }
    case 'reset':
      return {
        ...state,
        line: -1,
      }
    case 'step':
      const text = parseText(state.text.trim())
      const line = text[state.line]

      let change = {}
      switch (line) {
        case 'move up':
          change = {
            crab: { x: state.crab.x, y: state.crab.y - 1 }
          }
          break
        case 'move down':
          change = {
            crab: { x: state.crab.x, y: state.crab.y + 1 }
          }
          break
        case 'move left':
          change = {
            crab: { x: state.crab.x - 1, y: state.crab.y }
          }
          break
        case 'move right':
          change = {
            crab: { x: state.crab.x + 1, y: state.crab.y }
          }
          break
      }

      return {
        ...state,
        line: (state.line + 1) % text.length,
        ...change,
      }
  }

  return state
}

const INIT: State = {
  line: -1,
  crab: { x: 0, y: 0 },
  coco: { x: 3, y: 0 },
  tiles: WALLS,
  text: ''
}

const GRID_PX = 38

function App() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const [intv, setIntv] = useState(0 as any)

  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const handleInput = useCallback((val: any) => {
    dispatch({ type: 'edit', text: val })
  }, [dispatch])

  const stepNext = useCallback(() => {
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
          <div className="avatar crab" style={{
            background: `url(${Sprites}) no-repeat`,
            width: 32,
            height: 32,
            transform: `translate(${state.crab.x * GRID_PX + 4}px, ${state.crab.y * GRID_PX + 4}px)`
          }} />
          <div className="avatar coco" style={{
            background: `url(${Sprites}) no-repeat -32px 0`,
            width: 32,
            height: 32,
            transform: `translate(${state.coco.x * GRID_PX + 4}px, ${state.coco.y * GRID_PX + 4}px)`
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
        </div>`
      </div>`
    </>
  )
}

export default App;
