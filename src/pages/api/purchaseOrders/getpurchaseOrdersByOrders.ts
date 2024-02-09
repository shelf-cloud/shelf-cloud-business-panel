import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const getpurchaseOrdersByOrders: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)
    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/purchaseOrders/getpurchaseOrdersByOrders.php?businessId=${request.query.businessId}&status=${request.query.status}`)
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default getpurchaseOrdersByOrders