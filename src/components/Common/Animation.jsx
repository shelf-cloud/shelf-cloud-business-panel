import React from 'react'
import lottie from 'lottie-web'
import { defineLordIconElement } from 'lord-icon-element'
defineLordIconElement(lottie.loadAnimation)

const Animation = ({ src }) => {
  return (
    <lord-icon
      src={src}
      trigger="loop"
      colors="primary:#405189,secondary:#0ab39c"
      style={{ width: '50px', height: '50px' }}
    ></lord-icon>
  )
}

export default Animation