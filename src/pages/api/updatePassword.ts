import { NextApiHandler } from 'next'

import { authOptions } from '@pages/api/auth/[...nextauth]'
import axios from 'axios'
import { getServerSession } from 'next-auth'

const updatePassword: NextApiHandler = async (request, response) => {
  const session = await getServerSession(request, response, authOptions)

  if (session == null) {
    response.status(401).end()

    return
  }

  axios
    .post(`${process.env.API_LOGIN_SERVICE}/updatePassword.php?businessId=${request.query.businessId}`, {
      passwordInfo: request.body.passwordInfo,
    })
    .then(({ data }) => {
      response.json(data)
    })
    .catch((error) => {
      response.end(error)
    })
}

export default updatePassword
