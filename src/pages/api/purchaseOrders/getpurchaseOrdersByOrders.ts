import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const getpurchaseOrdersByOrders: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/purchaseOrders/getpurchaseOrdersByOrders.php?businessId=${request.query.businessId}`)
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default getpurchaseOrdersByOrders