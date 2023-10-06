import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const deleteSupplier: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })
    if (session == null) {
        response.status(401).end()

        return
    }

    axios.delete(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/settings/deleteSupplier.php?businessId=${request.query.businessId}&suppliersId=${request.query.suppliersId}`)
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default deleteSupplier