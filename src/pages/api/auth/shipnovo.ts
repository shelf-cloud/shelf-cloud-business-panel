import { NextApiHandler } from 'next'

import { enforceContentType, enforceRateLimit, rejectMethod } from '@lib/security/server'
import axios from 'axios'

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

const credentialsAuth: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['POST'])) {
    return
  }

  if (enforceContentType(request, response, ['application/json'])) {
    return
  }

  if (
    enforceRateLimit(request, response, {
      key: 'auth:shipnovo',
      limit: 20,
      windowMs: 60_000,
    })
  ) {
    return
  }

  const username = getStringValue(request.body?.username)
  const password = getStringValue(request.body?.password)

  if (!username || !password) {
    response.status(400).json({ error: true, message: 'Username and password are required.' })
    return
  }

  try {
    const { data } = await axios.post(`${process.env.API_LOGIN_SERVICE}/newLogin.php`, {
      username,
      password,
    })

    response.json(data)
  } catch (error) {
    response.json({
      error: true,
      message: 'Error from server please try again later.',
    })
  }
}

export default credentialsAuth
