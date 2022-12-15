import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const getShipmentOrder: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/getShipmentOrder.php?businessId=${request.query.businessId}&orderId=${request.query.orderId}`)
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default getShipmentOrder