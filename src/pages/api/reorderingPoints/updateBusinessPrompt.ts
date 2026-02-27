import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const updateBusinessPrompt: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  const sessionToken = request.cookies['next-auth.session-token'] ? request.cookies['next-auth.session-token'] : request.cookies['__Secure-next-auth.session-token']

  if (!session || !sessionToken) {
    response.status(401).end('Session not found')
    return
  }

  await axios
    .post(
      `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/reorderingPoints/update-business-prompt.php?businessId=${request.query.businessId}`,
      {
        prompt: request.body.prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TARS_API_AUTH_TOKEN}`,
        },
      }
    )
    .then(({ data }) => {
      response.json(data)
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        response.json({
          error: true,
          message: `Error Amazon API Integration ${error.response.data.error_description}, please try again later.`,
        })
      } else if (error.request) {
        // The request was made but no response was received
        response.json({
          error: true,
          message: 'Error from server please try again later.',
        })
      } else {
        // Something happened in setting up the request that triggered an Error
        response.json({
          error: true,
          message: error.message,
        })
      }
    })
}

export default updateBusinessPrompt
