import { NextApiHandler } from 'next'

import axios from 'axios'

const credentialsAuth: NextApiHandler = async (request, response) => {
  if (request.method !== 'POST') {
    // Not supported method
    response.status(405).end()
  }

  axios
    .post(`${process.env.API_LOGIN_SERVICE}/newLogin.php`, {
      username: request.body.username,
      password: request.body.password,
    })
    .then(({ data }) => response.json(data))
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        response.json({
          error: true,
          message: `Error from server please try again later.`,
        })
      } else if (error.request) {
        // The request was made but no response was received
        response.json({
          error: true,
          message: 'Error from server please try again later.',
        })
      } else {
        // Something happened in setting up the request that triggered an Error
        response.json({
          error: true,
          message: error.message,
        })
      }
    })
}

export default credentialsAuth
