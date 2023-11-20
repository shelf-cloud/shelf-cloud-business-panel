import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const setStateToSelectedProducts: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/products/setStateToSelectedProducts.php?businessId=${request.query.businessId}`, {
        newState: request.body.newState,
        selectedRows: request.body.selectedRows
    })
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default setStateToSelectedProducts