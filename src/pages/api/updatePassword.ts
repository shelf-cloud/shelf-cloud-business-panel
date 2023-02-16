import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const updatePassword: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_LOGIN_SERVICE}/updatePassword.php?businessId=${request.query.businessId}`, {
        passwordInfo: request.body.passwordInfo
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default updatePassword