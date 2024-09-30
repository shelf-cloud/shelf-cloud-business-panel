import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const mapListingToSku: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end()
        return
    }

    axios
        .patch(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/listings/mapListingToSku/${request.query.region}/${request.query.businessId}`, {
            listingId: request.body.listingId,
            listingSku: request.body.listingSku,
            shelfCloudSku: request.body.shelfCloudSku,
            shelfCloudSkuId: request.body.shelfCloudSkuId,
            shelfCloudSkuIsKit: request.body.shelfCloudSkuIsKit,
            fnSku: request.body.fnSku,
        })
        .then(async ({ data }) => {
            if (data.error) {
                response.json(data)
            }

            axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/products/mapListingToSku.php?businessId=${request.query.businessId}`, {
                listingId: request.body.listingId,
                listingSku: request.body.listingSku,
                shelfCloudSku: request.body.shelfCloudSku,
                shelfCloudSkuId: request.body.shelfCloudSkuId,
                shelfCloudSkuIsKit: request.body.shelfCloudSkuIsKit,
                fnSku: request.body.fnSku,
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
                            message: `Error Mapping, please try again later.`,
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
        })
        .catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                response.json({
                    error: true,
                    message: `Error Amazon API Integration, please try again later.`,
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

export default mapListingToSku