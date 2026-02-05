import { NextApiHandler } from 'next'

import sgMail from '@sendgrid/mail'

const sendContactForm: NextApiHandler = async (request, response) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  const msg = {
    to: 'info@shelf-cloud.com',
    from: 'info@shelf-cloud.com',
    subject: `New Contact Form - ${request.body.contactForm.name}`,
    html: `
              <h1>Contact Form:</h1>
              <p>Name: <strong>${request.body.contactForm.name}</strong></p>
              <p>Email: <strong>${request.body.contactForm.email}</strong></p>
              <p>Message: <strong>${request.body.contactForm.message}</strong></p>`,
  }

  sgMail
    .send(msg)
    .then(() => {
      response.json({
        error: false,
        message: 'Email has been sent',
      })
    })
    .catch((error) => {
      response.json({
        error: true,
        message: 'Error sending message',
        errorRes: error,
      })
    })
}

export default sendContactForm
