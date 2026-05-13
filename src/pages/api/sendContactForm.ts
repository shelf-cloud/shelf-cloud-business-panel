import { NextApiHandler } from 'next'

import { escapeHtml } from '@lib/security/html'
import { enforceContentType, enforceRateLimit, rejectMethod } from '@lib/security/server'
import sgMail from '@sendgrid/mail'

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

const sendContactForm: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['POST'])) {
    return
  }

  if (enforceContentType(request, response, ['application/json'])) {
    return
  }

  if (
    enforceRateLimit(request, response, {
      key: 'contact:send',
      limit: 5,
      windowMs: 10 * 60_000,
    })
  ) {
    return
  }

  const contactForm = request.body?.contactForm
  const name = getStringValue(contactForm?.name)
  const email = getStringValue(contactForm?.email)
  const message = getStringValue(contactForm?.message)

  if (!name || !email || !message) {
    response.status(400).json({ error: true, message: 'Name, email, and message are required.' })
    return
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  const msg = {
    to: 'info@shelf-cloud.com',
    from: 'info@shelf-cloud.com',
    subject: `New Contact Form - ${name}`,
    html: `
              <h1>Contact Form:</h1>
              <p>Name: <strong>${escapeHtml(name)}</strong></p>
              <p>Email: <strong>${escapeHtml(email)}</strong></p>
              <p>Message: <strong>${escapeHtml(message)}</strong></p>`,
  }

  try {
    await sgMail.send(msg)
    response.json({
      error: false,
      message: 'Email has been sent',
    })
  } catch (error) {
    response.json({
      error: true,
      message: 'Error sending message',
    })
  }
}

export default sendContactForm
