import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const cloneProduct: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end('Session not found')
        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/products/cloneProduct.php?businessId=${request.query.businessId}`, {
        clone: request.body
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
                    message: `Error API Integration ${error.response.data.error_description}, please try again later.`,
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

export default cloneProduct