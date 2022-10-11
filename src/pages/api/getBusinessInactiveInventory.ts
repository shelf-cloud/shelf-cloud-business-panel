import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import { Business } from '@typings'
import axios from 'axios'

const getBusinessInactiveInventory: NextApiHandler<Business> = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/getBusinessInactiveInventory.php?businessId=${request.query.businessId}`)
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default getBusinessInactiveInventory