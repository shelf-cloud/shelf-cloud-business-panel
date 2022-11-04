import { NextApiHandler } from 'next'
import { getSession } from '@auth/client'
import axios from 'axios'

const getuser: NextApiHandler = async (request, response) => {
    const session = await getSession({ req: request })

    if (session == null) {
        response.status(401).end()

        return
    }

    axios.post(`${process.env.API_DOMAIN_SERVICES}/getUser.php`, {
        username: session?.user?.name
    })
        .then(({ data }) => response.json(data))
        .catch((error) => {
            response.end(error)
        });
}

export default getuser