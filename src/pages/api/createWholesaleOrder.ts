import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const createWholesaleOrder: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/createWholesaleOrder.php?businessId=${request.query.businessId}`, {
        shippingProducts: request.body.shippingProducts,
        groovePackerProducts: request.body.groovePackerProducts,
        orderInfo: request.body.orderInfo
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default createWholesaleOrder