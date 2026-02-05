import { NextApiHandler } from 'next'

import sgMail from '@sendgrid/mail'
import axios from 'axios'

const requestForgotPassword: NextApiHandler = async (request, response) => {
  axios
    .post(`${process.env.API_LOGIN_SERVICE}/requestForgotPassword.php`, {
      email: request.body.email,
    })
    .then(({ data }) => {
      if (data.error) {
        response.json(data)
        return
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
      const msg = {
        to: request.body.email,
        from: 'info@shelf-cloud.com',
        subject: `Reset your password`,
        html: `
                      <h1>Hi ${data.name},</h1>
                      <p>We’ve received a request to reset your password.</p>
                      <p>If you didn’t make the request, just ignore this message. Otherwise, you can reset your password.</p>
                      <a href="${process.env.NEXTAUTH_URL}/Forgotpassword/${data.resetToken}" target="blank">Reset your Password</a>
                      <p>Thanks,</p>
                      <p>The ShelfCloud team</p>`,
      }

      sgMail
        .send(msg)
        .then(() => {
          response.json({
            error: data.error,
            msg: data.msg,
          })
        })
        .catch((error) => {
          response.json({
            error: data.error,
            msg: 'Error sending reset password mail',
            errorRes: error,
          })
        })
    })
    .catch((error) => {
      response.end(error)
    })
}

export default requestForgotPassword
