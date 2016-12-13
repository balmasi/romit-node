import nock from 'nock';

const ENDPOINTS = {
  sandbox: 'https://api.sandbox.romit.io/v1',
  production: 'https://api.romit.io/v1'
};

/**
 * Mock the response for request user authorisation api
 *
 * @param client_token - Client bearer token
 * @param client_id - The application key
 * @param response_type - Must be set to code
 * @param redirect_uri - URL where the callback payload will return the code that is redeemed for an access token.
 * @param scope - Permissions the application is requesting. See below for a list of available scopes. Scopes are delimited by a pipe:
 * @param state - A unique string passed in for this session that will be returned with the user code.
 * @param phone - E164 phone number of the user
 * @param email - The email address of the user
 * @param first - Legal first name
 * @param last - Legal last name
 * @param currency - The currency type the customer will be transacting in.
 * @param refresh - If set to true, will request a refresh token pair to be returned.
 * @param call - If set to true, will make a telephone call to the user and seek application permission. If set to false, it will send a text message.
 */
export function mockRequestUserAuthorisation (client_token, {
  client_id,
  response_type,
  redirect_uri,
  scope,
  state,
  phone,
  email,
  first,
  last,
  currency,
  refresh,
  call
  }) {
  // Nock for upsert new contact with fake email address
  nock(ENDPOINTS.sandbox, {
    reqheaders: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${client_token}`
    }
  })
    .post('/oauth', {
      ...arguments[0]
    })
    .reply(200, {
      success:true,
      error:null,
      response:{
      }
    });
}

/**
 * Mock the response for finish user authorisation api
 *
 * @param client_id - The application key
 * @param client_secret - Application secret
 * @param code - The authorization code that is included in the redirect URL
 * @param grant_type - This must be set to authorization_code
 * @param redirect_uri - The same redirect_uri specified in the initiation step
 */
export function mockFinishUserAuthorisation ({
  client_id,
  client_secret,
  code,
  grant_type,
  redirect_uri
  }) {
  // Nock for upsert new contact with fake email address
  nock(ENDPOINTS.sandbox, {
    reqheaders: {
      'Content-type': 'application/json'
    }
  })
    .post('/oauth/token', {
      ...arguments[0]
    })
    .reply(200, {
      success: true,
      error: null,
      response: {
        access_token: '68f144a2-35ea-44ed-8d2a-66000596b040',
        access_token_expires: '2015-10-21T19:20:30+01:00',
        refresh_token: '344bb945-9b1d-4959-a421-a1a21d26e94a',
        refresh_token_expires: '2015-12-21T19:20:30+01:00',
        token_type: 'bearer',
        scope: [
          'DEFAULT',
          'BANKING_READ',
          'BANKING_WRITE',
          'IDENTITY_READ',
          'IDENTITY_WRITE',
          'TRANSFER_READ',
          'TRANSFER_WRITE',
          'USER_READ',
          'USER_WRITE',
          'SUBSCRIPTION_READ',
          'SUBSCRIPTION_WRITE',
          'PLAN_READ',
          'PLAN_WRITE',
          'INVOICE_READ',
          'INVOICE_WRITE'
        ]
      }
    });
}