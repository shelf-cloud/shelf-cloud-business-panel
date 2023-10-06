import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const deleteBrand: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios.delete(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/settings/deleteBrand.php?businessId=${request.query.businessId}&brandId=${request.query.brandId}`)
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default deleteBrand