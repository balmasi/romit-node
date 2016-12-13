import supertest from 'supertest';
import chai from 'chai';
import nock from 'nock';
const expect = chai.expect;
const request = supertest(app);

const ROMIT_CLIENT_INFO = { client_id: 'e8ec8917-1852-4ca1-96d1-af4bf6dc1407', client_secret: '3cb5ce96-3f35-40f0-b76f-2c33c95cb32d' };

const ROMIT_CLIENT_TOKEN = 'e25da466-0420-4aa5-acef-1920b07545a6';
const ROMIT_ACCESS_TOKEN = 'aa2eff38-ec36-4232-b266-f0ea0ba71142';
const ROMIT_REFRESH_TOKEN = '344bb945-9b1d-4959-a421-a1a21d26e94a';

const REQUEST_AUTHRIZATION_PARAM = {
  client_id: 'e8ec8917-1852-4ca1-96d1-af4bf6dc1407',
  response_type: 'code',
  redirect_uri: 'https://example.com/auth/romit',
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
  ],
  state: 'my-secret-state-123456789',
  phone: '+17755551212',
  email: 'chadd@example.com',
  first: 'Baihu',
  last: 'Jin',
  currency: 'USD',
  refresh: true,
  call: false
};
