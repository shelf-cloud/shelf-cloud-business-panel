import { NextApiHandler } from 'next'

import { enforceContentType, enforceRateLimit, rejectMethod } from '@lib/security/server'
import axios from 'axios'

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

const resetPassword: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['POST'])) {
    return
  }

  if (enforceContentType(request, response, ['application/json'])) {
    return
  }

  if (
    enforceRateLimit(request, response, {
      key: 'password:reset',
      limit: 10,
      windowMs: 15 * 60_000,
    })
  ) {
    return
  }

  const resetPasswordInfo = request.body?.resetPasswordInfo
  const newPassword = getStringValue(resetPasswordInfo?.newPassword)
  const confirmPassword = getStringValue(resetPasswordInfo?.confirmPassword)
  const resetToken = getStringValue(resetPasswordInfo?.resetToken)

  if (!newPassword || !confirmPassword || !resetToken) {
    response.status(400).json({ error: true, message: 'Password reset details are required.' })
    return
  }

  try {
    const { data } = await axios.post(`${process.env.API_LOGIN_SERVICE}/resetPassword.php`, {
      newPassword,
      confirmPassword,
      resetToken,
    })

    response.json(data)
  } catch (error) {
    response.status(502).json({
      error: true,
      message: 'Error from server please try again later.',
    })
  }
}

export default resetPassword
