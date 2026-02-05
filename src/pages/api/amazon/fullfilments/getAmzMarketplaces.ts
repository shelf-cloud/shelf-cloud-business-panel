import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const getAmzMarketplaces: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)
  if (session == null) {
    response.status(401).end()
    return
  }

  axios(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/sellers/getSellerMarketplaces/${request.query.region}/${request.query.businessId}`)
    .then((amazonMarketplaces) => {
      if (amazonMarketplaces.data.error || amazonMarketplaces.data.marketplaces.length === 0) {
        response.json([])
        return
      }

      response.json(amazonMarketplaces.data.marketplaces)
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

export default getAmzMarketplaces
