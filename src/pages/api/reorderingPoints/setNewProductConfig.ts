import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const setNewProductConfig: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  if (session == null) {
    response.status(401).end()

    return
  }

  axios
    .post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/reorderingPoints/setNewProductConfig.php?businessId=${request.query.businessId}`, {
      inventoryId: request.body.inventoryId,
      leadTimeSC: request.body.leadTimeSC,
      leadTimeFBA: request.body.leadTimeFBA,
      leadTimeAWD: request.body.leadTimeAWD,
      daysOfStockSC: request.body.daysOfStockSC,
      daysOfStockFBA: request.body.daysOfStockFBA,
      daysOfStockAWD: request.body.daysOfStockAWD,
      buffer: request.body.buffer,
      sellerCost: request.body.sellerCost,
    })
    .then(({ data }) => {
      response.json(data)
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        response.json({
          error: true,
          message: `Error ${error.response.data.error_description}, please try again later.`,
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

export default setNewProductConfig
