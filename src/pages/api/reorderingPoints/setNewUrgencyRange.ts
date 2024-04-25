import { NextApiHandler } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'

const setNewUrgencyRange: NextApiHandler = async (request, response) => {
    const session = await getServerSession(request, response, authOptions)

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/reorderingPoints/setNewUrgencyRange.php?businessId=${request.query.businessId}`, {
        highAlertMax: request.body.highAlertMax,
        mediumAlertMax: request.body.mediumAlertMax,
        lowAlertMax: request.body.lowAlertMax,
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default setNewUrgencyRange