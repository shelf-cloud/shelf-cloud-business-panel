import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const getReorderingPointsProducts: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  const sessionToken = request.cookies['next-auth.session-token'] ? request.cookies['next-auth.session-token'] : request.cookies['__Secure-next-auth.session-token']

  if (!session || !sessionToken) {
    response.status(401).end('Session not found')
    return
  }

  axios
    .get(`${process.env.SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getReorderingPointsProducts?region=${request.query.region}&businessId=${request.query.businessId}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
    .then(async ({ data }) => {
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

export default getReorderingPointsProducts
