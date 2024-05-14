import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const getProductDetails: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)
    if (session == null) {
        response.status(401).end()

        return
    }

    await axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/getProductPageDetails.php?inventoryId=${request.query.inventoryId}&businessId=${request.query.businessId}`)
        .then(async ({ data: dataSC }) => {

            await axios(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/listings/getAmazonSellerListingSKU/${request.query.region}/${request.query.businessId}/${dataSC.sku}`)
                .then(async ({ data: dataFBA }) => {
                    let data = {
                        ...dataSC,
                        amazonFBA: dataFBA.listings
                    }
                    response.json(data)
                }).catch(() => {
                    response.json(dataSC)
                })
        })
        .catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                response.json({
                    error: true,
                    message: `Error Product Details, please try again later.`,
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
        });
}

export default getProductDetails