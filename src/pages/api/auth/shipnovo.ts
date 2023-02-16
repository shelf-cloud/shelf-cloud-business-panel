import { NextApiHandler } from 'next'
import { Business } from '@typings'
import axios from 'axios'

const credentialsAuth: NextApiHandler<Business> = async (request, response) => {
    if (request.method !== 'POST') {
        // Not supported method
        response.status(405).end()
    }

    axios.post(`${process.env.API_LOGIN_SERVICE}/login.php`, {
        username: request.body.username,
        password: request.body.password
    })
        .then(({ data }) => response.json(data))
        .catch((error) => {
            response.end(error)
        });
}

export default credentialsAuth