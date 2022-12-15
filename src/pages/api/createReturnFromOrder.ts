import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const createReturnFromOrder: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/createReturnFromOrder.php?businessId=${request.query.businessId}&orderId=${request.query.orderId}`, {
        returnItems: request.body.returnItems
    })
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default createReturnFromOrder