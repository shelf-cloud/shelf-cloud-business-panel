import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import { Business } from '@typings'
import axios from 'axios'

const getbusinesssumary: NextApiHandler<Business> = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/getProductInventoryBins.php`, {
        inventoryId: request.body.inventoryId,
        businessId: request.body.businessId,
    })
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default getbusinesssumary