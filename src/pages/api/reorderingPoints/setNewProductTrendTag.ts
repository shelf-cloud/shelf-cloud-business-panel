import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const setNewProductTrendTag: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  if (session == null) {
    response.status(401).end()

    return
  }

  axios
    .post(
      `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/reorderingPoints/set-new-product-trend-tag.php?businessId=${request.query.businessId}`,
      {
        products: request.body.products,
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
        response.json({
          error: true,
          message: `Error ${error.response.data.error_description}, please try again later.`,
        })
      } else if (error.request) {
        response.json({
          error: true,
          message: 'Error from server please try again later.',
        })
      } else {
        response.json({
          error: true,
          message: error.message,
        })
      }
    })
}

export default setNewProductTrendTag
