import Crabcoco from './crabcoco.gif'
import Cooked from './cooked.jpg'
import './win.css'

type WinProps = {
  goNext: () => void
}

export function Win({ goNext }: WinProps) {
  return <div className="win">
    <div className="win-modal">
      <button>You Win!</button>
      <img src={Crabcoco} />
      <button type="button" onClick={goNext}>{'Go to next level >>'}</button>
    </div>
  </div >
}


type LoseProps = {
  restart: () => void
}

export function Lose({ restart }: LoseProps) {
  return <div className="win">
    <div className="win-modal">
      <button>{'Oh no... you are cooked!'}</button>
      <img src={Cooked} />
      <button type="button" onClick={restart}>{'Try again!'}</button>
    </div>
  </div >
}

