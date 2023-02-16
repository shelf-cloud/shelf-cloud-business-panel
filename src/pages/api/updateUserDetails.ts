import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const updateUserDetails: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/updateUserDetails.php?businessId=${request.query.businessId}`, {
        userDetails: request.body.userDetails
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default updateUserDetails