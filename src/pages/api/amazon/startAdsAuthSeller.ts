import { NextApiHandler } from 'next'

import { createOAuthState, getAuthorizedTenant, rejectMethod } from '@lib/security/server'

const addAdsAuthSeller: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['GET'])) {
    return
  }

  const tenant = await getAuthorizedTenant(request, response)

  if (tenant == null) {
    return
  }

  const baseUrl = tenant.region === 'us' ? 'https://www.amazon.com/ap/oa' : 'https://eu.account.amazon.com/ap/oa'
  const redirectUri = `${process.env.NEXTAUTH_URL}/amazon-sellers/amazonAdsAuthRedirect`

  const authUrl = new URL(baseUrl)
  authUrl.searchParams.set('scope', 'advertising::campaign_management')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', 'amzn1.application-oa2-client.fe75e469490f408baf6ccfbde82fe836')
  authUrl.searchParams.set(
    'state',
    createOAuthState(response, 'sc-amz-ads-oauth-state', {
      businessId: tenant.businessId,
      mode: 'ads',
      username: tenant.username,
    })
  )
  authUrl.searchParams.set('redirect_uri', redirectUri)

  response.redirect(307, authUrl.toString())
}

export default addAdsAuthSeller
