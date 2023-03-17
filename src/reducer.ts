import React, { Reducer, ReducerAction, useReducer, useState } from "react";


export function useCustomReducer<T>(reducer: (state: T, action: any) => T, initialState: T): [T, React.Dispatch<any>] {
  const [history, setHistory] = useState<Array<T>>([])

  const [state, dispatch] = useReducer(reducer, initialState);

  let customDispatch = (a: any) => {
    if (a.type === '@REWIND') {
      const [lastState] = history.slice(-1)
      if (lastState == null) return

      a.lastState = lastState
      dispatch(a)
      setHistory(history.slice(0, -1))
      return
    } else if (a.type === 'step') {
      dispatch(a)
      setHistory([...history, state])
    } else {
      dispatch(a)
      setHistory([])
    }
  }
  return [state, customDispatch];
}
