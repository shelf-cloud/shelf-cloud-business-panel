import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const addPoManually: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)
    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/purchaseOrders/addPoManually.php?businessId=${request.query.businessId}`, {
        poInfo: request.body
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default addPoManually