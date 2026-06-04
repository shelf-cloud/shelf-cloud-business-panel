import { RefObject, useEffect, useRef } from 'react'

export const useClickOutside = <T extends HTMLElement>(ref: RefObject<T | null>, onClickOutside: () => void) => {
  const onClickOutsideRef = useRef(onClickOutside)

  useEffect(() => {
    onClickOutsideRef.current = onClickOutside
  }, [onClickOutside])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const element = ref.current

      if (element && event.target instanceof Node && !element.contains(event.target)) {
        onClickOutsideRef.current()
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [ref])
}
