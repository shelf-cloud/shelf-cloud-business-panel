import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const getMarketplacesInfo: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/marketplaces/getMarketplacesInfo.php?businessId=${request.query.businessId}`)
        .then(async ({ data }) => {

            axios(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/sellers/getSellerMarketplaces/${request.query.region}/${request.query.businessId}`)
                .then((amazonMarketplaces) => {

                    if (amazonMarketplaces.data.error || amazonMarketplaces.data.marketplaces.length === 0) {
                        response.json(data)
                        return
                    }

                    for (const marketplaces of amazonMarketplaces.data.marketplaces) {
                        data.marketplaces.unshift({
                            logo: "https://onixventuregroup.goflow.com/images/channels/amazon.svg",
                            storeId: marketplaces.marketplaceId,
                            name: `FBA ${marketplaces.marketplaceName}`,
                        })
                    }

                    response.json(data)
                })
                .catch(() => {
                    response.json(data)
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

export default getMarketplacesInfo