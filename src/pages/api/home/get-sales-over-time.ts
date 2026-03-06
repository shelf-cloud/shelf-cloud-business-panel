import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import moment from 'moment'
import { getServerSession } from 'next-auth'

const getSalesOverTime: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  const sessionToken = request.cookies['next-auth.session-token'] ? request.cookies['next-auth.session-token'] : request.cookies['__Secure-next-auth.session-token']

  if (!session || !sessionToken) {
    response.status(401).end('Session not found')
    return
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const startDate = moment().startOf('day').subtract(1, 'days').format('YYYY-MM-DD')
  const endDate = moment().endOf('day').format('YYYY-MM-DD')

  axios
    .get(
      `${process.env.SHELFCLOUD_SERVER_URL}/api/orders/getSalesOverTime?region=${request.query.region}&businessId=${request.query.businessId}&startDate=${startDate}&endDate=${endDate}&storeId=9999&timezone=${timezone}`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )
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

export default getSalesOverTime
