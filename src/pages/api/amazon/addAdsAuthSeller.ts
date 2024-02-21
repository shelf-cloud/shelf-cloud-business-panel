import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const addAdsAuthSeller: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  if (session == null) {
    response.status(401).end('Session not found')
    return
  }

  const amazonAuthUrl = request.query.region === 'us' ? process.env.AMAZON_ADS_LWA_AUTH_US : process.env.AMAZON_ADS_LWA_AUTH_EU
  const code = request.query.code
  const businessId = request.query.businessId

  if (!amazonAuthUrl || typeof code !== 'string') {
    response.status(400).end('Invalid request parameters')
    return
  }

  const url = `${amazonAuthUrl}&code=${code}`

  axios
    .post(url)
    .then(async ({ data }) => {
      axios
        .post(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/ads/addAdsSeller`, {
          businessUniqId: businessId,
          seller_region: request.query.region,
          adsapi_oauth_code: code,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          adsapi_endpoint: request.query.region === 'us' ? 'https://advertising-api.amazon.com' : 'https://advertising-api-eu.amazon.com',
        })
        .then(() => {
          axios
            .get(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/amazon/newAmazonAdsSeller.php?businessId=${request.query.businessId}`)
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
        .catch((error) => {
          response.json({
            error: true,
            errorMsg: error,
            message: 'Error in ShelfCloud Server, Please try again later.',
          })
        })
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        response.json({
          error: true,
          message: `Error Amazon Ads API Integration ${error.response.data.error_description}, please try again later.`,
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

export default addAdsAuthSeller
