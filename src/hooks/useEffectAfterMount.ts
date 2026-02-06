/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'

export default function useEffectAfterMount(fn: () => void, deps: any[] = []) {
  const hasMounted = useRef(false)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    fn()
  }, deps)
}
