import React from 'react'

import { defineLordIconElement } from 'lord-icon-element'
import lottie from 'lottie-web'

defineLordIconElement(lottie.loadAnimation)

const Animation = ({ src, style, colors }) => {
  return <lord-icon type='module' src={src} trigger='loop' colors={colors} style={style} />
}

export default Animation
