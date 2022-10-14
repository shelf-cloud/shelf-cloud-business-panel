import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import { Business } from '@typings'
import axios from 'axios'

const getShipmentsOrders: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/getShipmentsOrders.php?businessId=${request.query.businessId}&startDate=${request.query.startDate}&endDate=${request.query.endDate}`)
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default getShipmentsOrders