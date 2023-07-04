import './tutorial.css'

type TutorialProps = {
  onClose: any
}

export function Tutorial({ onClose }: TutorialProps) {
  return <div className="tutorial">
    <div className="tutorial-inner">
      <div className="tutorial-exit" onClick={onClose}>X</div>
      <h4>Buttons</h4>
      <div>NEW: Start over</div>
      <div>STOP: Stop play</div>
      <div>BACK: 1 step backward</div>
      <div>STEP: 1 step forward</div>
      <div>PLAY: Keep stepping forward</div>
      <h4>Words</h4>
      <div>direction: left, right, up, down</div>
      <div>go [direction]</div>
      <div>go back</div>
      <div>went? [direction]: returns true if position has been visited
        <br />(or can't be visited)</div>
      <div>-[words] run if last result is negative</div>
      <div>+[words] run if last result is positive</div>
    </div>
  </div>
}

type IconProps = {
  onClick: any
}

export function TutorialIcon({ onClick }: IconProps) {
  return <div
    className="tutorial-icon"
    onClick={onClick}
  >
    ?
  </div>
}
