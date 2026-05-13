import { NextApiHandler } from 'next'

import { escapeHtml } from '@lib/security/html'
import { enforceContentType, enforceRateLimit, rejectMethod } from '@lib/security/server'
import sgMail from '@sendgrid/mail'
import axios from 'axios'

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

const requestForgotPassword: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['POST'])) {
    return
  }

  if (enforceContentType(request, response, ['application/json'])) {
    return
  }

  if (
    enforceRateLimit(request, response, {
      key: 'password:forgot',
      limit: 5,
      windowMs: 15 * 60_000,
    })
  ) {
    return
  }

  const email = getStringValue(request.body?.email)

  if (!email) {
    response.status(400).json({ error: true, message: 'Email is required.' })
    return
  }

  try {
    const { data } = await axios.post(`${process.env.API_LOGIN_SERVICE}/requestForgotPassword.php`, {
      email,
    })

    if (data.error) {
      response.json(data)
      return
    }

    const resetToken = getStringValue(data.resetToken)

    if (!resetToken) {
      response.status(502).json({
        error: true,
        msg: 'Error sending reset password mail',
      })
      return
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    const msg = {
      to: email,
      from: 'info@shelf-cloud.com',
      subject: `Reset your password`,
      html: `
                      <h1>Hi ${escapeHtml(getStringValue(data.name) || 'there')},</h1>
                      <p>We’ve received a request to reset your password.</p>
                      <p>If you didn’t make the request, just ignore this message. Otherwise, you can reset your password.</p>
                      <a href="${process.env.NEXTAUTH_URL}/Forgotpassword/${encodeURIComponent(resetToken)}" target="_blank" rel="noopener noreferrer">Reset your Password</a>
                      <p>Thanks,</p>
                      <p>The ShelfCloud team</p>`,
    }

    try {
      await sgMail.send(msg)
      response.json({
        error: data.error,
        msg: data.msg,
      })
    } catch (error) {
      response.json({
        error: data.error,
        msg: 'Error sending reset password mail',
      })
    }
  } catch (error) {
    response.status(502).json({
      error: true,
      message: 'Error from server please try again later.',
    })
  }
}

export default requestForgotPassword
