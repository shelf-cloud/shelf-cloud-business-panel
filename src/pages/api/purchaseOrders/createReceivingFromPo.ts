import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const createReceivingFromPo: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/purchaseOrders/createReceivingFromPo.php?businessId=${request.query.businessId}`, {
        shippingProducts: request.body.shippingProducts,
        orderInfo: request.body.orderInfo,
        poInfo: request.body.poInfo,
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default createReceivingFromPo