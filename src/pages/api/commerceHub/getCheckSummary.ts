import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const getCheckSummary: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end('Session not found')
        return
    }

    let url = `${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/commerceHub/getCheckSummary.php?businessId=${request.query.businessId}&offset=${request.query.offset}&limit=${request.query.limit}`

    if (request.query.search) url += `&search=${encodeURIComponent(request.query.search as string)}`
    if (request.query.startDate) url += `&startDate=${request.query.startDate}`
    if (request.query.endDate) url += `&endDate=${request.query.endDate}`
    if (request.query.store) url += `&store=${request.query.store}`
    url += `&sortBy=${request.query.sortBy}&direction=${request.query.direction}`
    
    axios
        .get(url)
        .then(({ data }) => {
            response.json(data)
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

export default getCheckSummary
