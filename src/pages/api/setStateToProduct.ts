import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const setStateToProduct: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/setStateToProduct.php?businessId=${request.query.businessId}&inventoryId=${request.query.inventoryId}`, {
        newState: request.body.newState,
        sku: request.body.sku
    })
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default setStateToProduct