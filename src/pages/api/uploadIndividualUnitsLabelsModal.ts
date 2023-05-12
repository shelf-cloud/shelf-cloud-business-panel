import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const uploadIndividualUnitsLabelsModal: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/${request.query.region}/api/uploadIndividualUnitsLabelsModal.php?businessId=${request.query.businessId}`, {
        orderId: request.body.orderId,
        labelsName: request.body.labelsName,
        palletLabels: request.body.palletLabels
    })
        .then(({ data }) => {
            response.json(data)
        })
        .catch((error) => {
            response.end(error)
        });
}

export default uploadIndividualUnitsLabelsModal