import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const getuser: NextApiHandler = async (request: NextApiRequest, response: NextApiResponse) => {
    const session = await getServerSession(request, response, authOptions)
    if (session == null) {
        response.json({ error: true, message: 'Session Expired!' })
        return
    }

    axios.post(`${process.env.API_LOGIN_SERVICE}/getUser.php`, {
        username: session?.user?.name
    })
        .then(({ data }) => response.json(data))
        .catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                response.json({
                    error: true,
                    message: `Error User API ${error.response.data.error_description}, please try again later.`,
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

export default getuser