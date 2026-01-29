import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const createWholesaleOrderIndividualUnits: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)
  if (session == null) {
    response.status(401).end()

    return
  }

  axios
    .post(
      `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/orders/createWholesaleOrderIndividualUnits.php?businessId=${request.query.businessId}`,
      {
        shippingProducts: request.body.shippingProducts,
        groovePackerProducts: request.body.groovePackerProducts,
        orderInfo: request.body.orderInfo,
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

export default createWholesaleOrderIndividualUnits
