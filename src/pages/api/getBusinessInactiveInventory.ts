import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import { Business } from '@typings'
import axios from 'axios'

const getBusinessInactiveInventory: NextApiHandler<Business> = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end()

        return
    }

    axios(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/getBusinessInactiveInventoryTest.php?businessId=${request.query.businessId}`)
        .then(({ data }) => {
            response.json(data)})
        .catch((error) => {
            response.end(error)
        });
}

export default getBusinessInactiveInventory