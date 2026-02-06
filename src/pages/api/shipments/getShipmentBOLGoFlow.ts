import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const getShipmentBOLGoFlow: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)
  if (session == null) {
    response.status(401).end()

    return
  }

  axios
    .get(
      `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/shipments/getShipmentBOLGoFlow.php?businessId=${request.query.businessId}&orderId=${request.query.orderId}`
    )
    .then(({ data }) => {
      response.json(data)
    })
    .catch((error) => {
      response.end(error)
    })
}

export default getShipmentBOLGoFlow
