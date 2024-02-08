import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const setSelectedRowsHidden: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()
        return
    }

    axios
        .patch(`${process.env.SHELFCLOUD_SERVER_URL}/amazon/listings/setSelectedRowsHidden/${request.query.region}/${request.query.businessId}`, {
            Listings: request.body.Listings,
        })
        .then(async ({ data }) => {
            response.json(data)
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

export default setSelectedRowsHidden