import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const getpurchaseOrdersBySuppliers: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/purchaseOrders/getpurchaseOrdersBySuppliers.php?businessId=${request.query.businessId}&status=${request.query.status}`)
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default getpurchaseOrdersBySuppliers