import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const markNotificationsAsRead: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end('Session not found')
        return
    }

    axios
        .get(`${process.env.SHELFCLOUD_SERVER_URL}/api/notifications/markNotificationsAsRead/${request.query.region}/${request.query.businessId}`)
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

export default markNotificationsAsRead
