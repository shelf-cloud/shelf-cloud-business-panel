import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const addAuthSeller: NextApiHandler = async (request, response) => {
  const session = await getSession({ req: request })

  if (session == null) {
    response.status(401).end('Session not found')
    return
  }

  const amazonAuthUrl = process.env.AMAZON_LWA_AUTH
  const code = request.query.code
  const businessId = request.query.businessId
  const sellerId = request.query.sellerId

  if (!amazonAuthUrl || typeof code !== 'string') {
    response.status(400).end('Invalid request parameters')
    return
  }

  const url = `${amazonAuthUrl}&code=${code}`

  axios
    .post(url)
    .then(async ({ data }) => {
      axios
        .post(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/sellers/addSeller`, {
          businessUniqId: businessId,
          seller_region: request.query.region,
          selling_partner_id: sellerId,
          spapi_oauth_code: code,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          marketplace_Id: request.query.region === 'us' ? 'ATVPDKIKX0DER' : 'A1RKKUPIHCS9HS',
          spapi_endpoint: request.query.region === 'us' ? 'sellingpartnerapi-na.amazon.com' : 'sellingpartnerapi-eu.amazon.com',
        })
        .then(() => {
          axios
            .get(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/amazon/newAmazonSeller.php?businessId=${request.query.businessId}`)
            .then(({ data }) => {
              response.json(data)
            })
            .catch((error) => {
              response.json({
                error: true,
                errorMsg: error,
                message: 'Error in ShelfCloud Server, Please try again later.',
              })
            })
        })
        .catch((err) => {
          response.json(err)
        })
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
          message: 'No response from server',
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

export default addAuthSeller
