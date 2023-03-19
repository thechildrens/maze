import { useEffect, useState } from "react";

export function useLocalStorage<T>(name: string) {
  const [data, setData] = useState<T>(() => {
    const saved = localStorage.getItem(name)
    if (saved) {
      return JSON.parse(saved)
    }
    return {}
  })

  function _setData(d: T) {
    setData(d)
    localStorage.setItem(name, JSON.stringify(d))
  }

  return [data, _setData]
}