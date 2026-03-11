import { NextApiHandler } from 'next'

import { createOAuthState, getAuthorizedTenant, rejectMethod } from '@lib/security/server'

const startAuthSeller: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['GET'])) {
    return
  }

  const tenant = await getAuthorizedTenant(request, response)

  if (tenant == null) {
    return
  }

  const mode = request.query.mode === 'reauth' ? 'reauth' : 'new'
  const baseUrl = tenant.region === 'us' ? 'https://sellercentral.amazon.com/apps/authorize/consent' : 'https://sellercentral-europe.amazon.com/apps/authorize/consent'
  const authUrl = new URL(baseUrl)

  authUrl.searchParams.set('application_id', 'amzn1.sp.solution.9ab6cdba-3a1d-4aaf-8e00-0d3c012bd7de')
  authUrl.searchParams.set('version', 'beta')
  authUrl.searchParams.set(
    'state',
    createOAuthState(response, 'sc-amz-oauth-state', {
      businessId: tenant.businessId,
      mode,
      username: tenant.username,
    })
  )

  response.redirect(307, authUrl.toString())
}

export default startAuthSeller
