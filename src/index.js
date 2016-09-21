/**
 * Created by balmasi on 2016-09-20.
 */
import axios from 'axios';

const ENDPOINTS = {
  sandbox: 'https://api.sandbox.romit.io/v1',
  production: 'https://api.romit.io/v1'
};

const ERRORS = {
  'err.rate_limit_exceeded':	'Money movement transactions are rate limited to 1 request every 5 seconds',
  'err.access_denied':	'The client or user does not have access to the requested resource',
  'err.invalid_arguments':	'The request object is invalid',
  'err.unexpected_error':	'An unexpected internal error occurred',
  'err.fatal_error':	'An internal fatal error occurred'
};


const SCOPES = {
  'DEFAULT':	'DEFAULT', //  Access to basic information
  'BANKING_READ':	'BANKING_READ', //  Read access to Banking
  'BANKING_WRITE':	'BANKING_WRITE', //  Write access to Banking
  'IDENTITY_READ':	'IDENTITY_READ', //  Read access to Identity
  'IDENTITY_WRITE':	'IDENTITY_WRITE', //  Write access to Identity
  'TRANSFER_READ':	'TRANSFER_READ', //  Read access to Transfer
  'TRANSFER_WRITE':	'TRANSFER_WRITE', //  Write access to Transfer
  'USER_READ':	'USER_READ', //  Read access to User
  'USER_WRITE':	'USER_WRITE', //  Write access to User
  'SUBSCRIPTION_READ':	'SUBSCRIPTION_READ', //  Read access to Subscription
  'SUBSCRIPTION_WRITE':	'SUBSCRIPTION_WRITE', //  Write access to Subscription
  'PLAN_READ':	'PLAN_READ', //  Read access to Plan
  'PLAN_WRITE':	'PLAN_WRITE', //  Write access to Plan
  'INVOICE_READ':	'INVOICE_READ', // Read access to Invoice
  'INVOICE_WRITE':	'INVOICE_WRITE' //  Write access to Invoice
};

export default class RomitAPI {
  constructor({ client_id, client_secret, sandbox = false}) {
    this.client_info = {
      client_id,
      client_secret
    };
    this.sandbox = sandbox;
    this._axios =  axios.create({
      baseURL: sandbox ? ENDPOINTS.sandbox : ENDPOINTS.production,
      timeout: 1000,
      headers: { 'content-type': 'application/json' }
    });
  }

  _updateBearer ({ access_token}) {
    if (!access_token) return;
    this._axios.defaults.headers.common.Authorization =  `Bearer ${access_token}`;
  }


  /**
   * ========  OAUTH  ======
   */

  request_user_authorization({
    redirect_uri,
    scope = Object.keys(SCOPES),
    response_type = 'code',
    state,
    phone,
    email,
    first,
    last,
    currency = 'USD',
    refresh = 'true',
    call = false,
  }) {

    return this._axios.post('/oauth', {
      ...arguments[0],
      ...this.client_info
    });
  }

  async finish_user_authorization({
    code,
    grant_type = 'authorization_code',
    redirect_uri = this.redirect_uri
  }) {
    const apiResponse = await this._axios.post('/oauth/token', {
      ...arguments[0],
      ...this.client_info
    });

    this._updateBearer(apiResponse.response);
    return apiResponse;
  }

  async refresh_user_authorization({
    code,
    grant_type = 'refresh_token',
    refresh_token
  }) {

    const apiResponse = await this._axios.post('/oauth/token', {
      ...arguments[0],
      ...this.client_info
    });

    this._updateBearer(apiResponse.response);
    return apiResponse;
  }


  async get_client_access_token({
    grant_type = 'client_credentials'
  }) {
    const apiResponse  = await this._axios.post('/oauth/token', {
      ...arguments[0],
      ...this.client_info
    });

    this._updateBearer(apiResponse.response);
    return apiResponse;
  }



  /**
   * ========  APPLICATION  ======
   */

  get_appication() {
    return this._axios.get('/');
  }

  /**
   * ========  BANKING  ======
   */
  get_banking({ limit, offset }) {
    return this._axios.get('/banking', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_banking_card(id) {
    return this._axios.get(`/banking/card/${id}`);
  }

  create_banking_card({
    label,
    name,
    number,
    month,
    year,
    cvv,
    postal
  }) {
    return this._axios.post('/banking/card', arguments[0]);
  }

  update_banking_card (id, {
    label,
    month,
    year,
    cvv,
    postal
  }) {
    return this._axios.put(`/banking/card/${id}`, arguments[1])
  }

  disable_banking_card (id) {
    return this._axios.post(`/banking/card/${id}/disable`);
  }

  get_banking_account (id) {
    return this._axios.put(`/banking/account/${id}`);
  }

  link_banking_accounts ({
    username,
    password,
    instituation,
    pin
  }) {
    return this._axios.post('/banking/account/link', arguments[0])
  }

  link_mfa_banking_accounts ({
    answer,
    selections,
    code,
    sendMethodMask
  }) {
    return this._axios.post('/banking/account/link/step', arguments[0])
  }

  update_banking_account (id, {
    label
  }) {
    return this._axios.put(`/banking/account/${id}`, arguments[1])
  }

  disable_banking_account (id) {
    return this._axios.put(`/banking/account/${id}/disable`);
  }


  /**
   * ========  Identity  ======
   */


  list_identities ({ limit, offset }) {
    return this._axios.get('/identity', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_identity_info (id) {
    return this._axios.get(`/identity/info/${id}`);
  }

  create_identity_info ({
    first,
    last,
    addressOne,
    addressTwo,
    city,
    state,
    postal,
    country,
    dob,
    gender,
    type
  }) {
    return this._axios.post(`/identity/info/`, arguments[0]);
  }

  get_identity_document (id) {
    return this._axios.get(`/identity/document/${id}`);
  }

  create_identity_document ({
    file,
    type
  }) {
    return this._axios.post('/identity/document', arguments[0]);
  }

  get_identity_social_network (id) {
    return this._axios.get(`/identity/social/${id}`);
  }

  create_identity_social_network ({
    token,
    type
  }) {
    return this._axios.post('/identity/social', arguments[0]);
  }

  get_identity_business (id) {
    return this._axios.get(`/identity/business/${id}`);
  }

  create_identity_business ({
    ein,
    name,
    addressOne,
    addressTwo,
    city,
    state,
    postal,
    country,
    phone,
    website,
    description
  }) {
    return this._axios.post('/identity/business', arguments[0]);
  }

  /**
   * ========  TRANSFER  ======
   */

  list_transfers ({ limit, offset }) {
    return this._axios.get('/transfer', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_transfer (id) {
    return this._axios.get(`/transfer/${id}`);
  }

  create_transfer ({
    amount,
    phone,
    userId,
    bankingId,
    invoiceId,
    memo,
    mode
  }) {
    return this._axios.post(`/transfer`, );
  }

  capture_transfer (id, {
    amount
  }) {
    return this._axios.post(`/transfer/${id}/capture`, arguments[1]);

  }

  refund_transfer (id, {
    amount,
    memo
  }) {
    return this._axios.post(`/transfer/${id}/refund`, arguments[1]);
  }

  void_transfer (id) {
    return this._axios.post(`/transfer/${id}/void`);
  }


  /**
   * ========  USER  ======
   */
  get_public_user (id, {
    userId,
    phoneE164
  }) {
    return this._axios.get(`/user/${id}`, {
      params: Object.assign({}, arguments[1])
    })
  }

  get_user () {
    return this._axios.get(`/user`);
  }

  /**
   * ========  SUBSCRIPTION ======
   */
  list_subscription ({ limit, offset }) {
    return this._axios.get('/subscription', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_subscription (id) {
    return this._axios.get(`/subscription/${id}`);
  }

  create_subscription ({
    bankingId,
    planId
  }) {
    return this._axios.post('/subscription', arguments[0]);
  }

  update_subscription (id, {
    bankingId,
    planId
  }) {
    return this._axios.put(`/subscription/${id}`, arguments[1]);
  }

  cancel_subscription (id) {
    return this._axios.post(`/subscription/${id}/cancel`);

  }


  /**
   * ========  PLAN  ======
   */
  list_plan ({ limit, offset }) {
    return this._axios.get('/plan', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_public_plan (id) {
    return this._axios.get(`/plan/${id}`);
  }

  // same as above?
  get_plan (id) {
    return this._axios.get(`/plan/${id}`);
  }

  create_plan ({
    name,
    amount,
    interval,
    cycles,
    memo,
    callback
  }) {
    return this._axios.post('/plan', arguments[0]);
  }

  update_plan (id, {
    name,
    memo,
    callback
  }) {
    return this._axios.put(`/plan/${id}`, arguments[1]);
  }

  disable_plan () {
    return this._axios.post(`/plan/${id}/disable`);
  }


  /**
   * ========  INVOICE  ======
   */
  list_invoice ({ limit, offset }) {
    return this._axios.get('/invoice', {
      params: Object.assign({}, arguments[0])
    });
  }

  get_public_invoice (id) {
    return this._axios.get(`/invoice/${id}`);
  }

  get_invoice (id) {
    return this._axios.get(`/invoice/${id}`);
  }

  create_invoice ({
    description,
    amount,
    invoiceDate,
    dueDate,
    reference,
    note,
    memo,
    terms
  }) {
    return this._axios.post('/invoice', arguments[0]);
  }

  update_invoice (id, {
    reference,
    memo
  }) {
    return this._axios.put(`/invoice/${id}`, arguments[1]);
  }


  cancel_invoice () {
    return this._axios.post(`/invoice/${id}/cancel`);
  }

}


