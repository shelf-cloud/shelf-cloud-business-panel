import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const deleteBrand: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)
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