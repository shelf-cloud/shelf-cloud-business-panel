import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import sgMail from '@sendgrid/mail'

const sendMail: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
      const msg = {
        'from': {
          'name': 'Shelf Cloud Contact Form',
          'email': 'info@shelf-cloud.com',
        },
        'personalizations': [{
          'to': {
            'email': 'info@shelf-cloud.com',
          },
          'dynamicTemplateData': {
            'subject': `Shelf Cloud Contact from ${request.body.message.companyName}`,
            'businessName': request.body.message.companyName,
            'businessEmail': request.body.message.email,
            'businessSubject': request.body.message.subject,
            'businessMessage': request.body.message.message,
          },
        }],
        'templateId': 'd-482f81e23d1c4d9f83e326048ca74060',
      }

      sgMail
        .send(msg)
        .then(() => {
          response.json({
            error: false,
            message: 'Email has been sent'
          })
        })
        .catch((error) => {
          response.json({
            error: true,
            message: 'Error sending message',
            errorRes: error
          })
        })
}

export default sendMail