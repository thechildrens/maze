import Crabcoco from './crabcoco.gif'
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

