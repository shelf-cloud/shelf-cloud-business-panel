import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const createNewPurchaseOrder: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  if (session == null) {
    response.status(401).end()
    return
  }

  axios
    .post(
      `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/reorderingPoints/create-purchase-order-3pl.php?businessId=${request.query.businessId}`,
      {
        orderNumber: request.body.orderNumber,
        destinationSC: request.body.destinationSC,
        warehouseId: request.body.warehouseId,
        poItems: request.body.poItems,
        hasSplitting: request.body.hasSplitting,
        splits: request.body.splits,
        selectedSupplier: request.body.selectedSupplier,
        name3PL: request.body.name3PL,
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
          message: `Error from server please try again later.`,
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

export default createNewPurchaseOrder
