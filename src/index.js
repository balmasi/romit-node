/**
 * Created by balmasi on 2016-09-20.
 */
import axios from 'axios';
import _ from 'lodash';

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

function getHeader (accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
}

function augmentAPICall (apiFunction) {
  const augmentedError = new Error();
  return async function wrappedApi (...args) {
    try {
      const { data: romitResponse} = await apiFunction(...args);
      return romitResponse.response;
    } catch (error) {
      augmentedError.message = _.get(error, 'response.data.error.message');
      augmentedError.url = _.get(error, 'config.url');
      throw augmentedError;
    }
  };
}

export default class RomitAPI {
  constructor({ client_id, client_secret, sandbox = true}) {
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

  /**
   * ========  OAUTH  ======
   */

  get request_user_authorization() {
    return augmentAPICall(
      function request_user_authorization(client_token, {
        client_id,
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
          ...arguments[1]
        }, getHeader(client_token));
      }
    );
  }

  get finish_user_authorization() {
    return augmentAPICall(
      function finish_user_authorization({
        code,
        grant_type = 'authorization_code',
        redirect_uri = this.redirect_uri
        }) {
        return this._axios.post('/oauth/token', {
          ...arguments[0],
          ...this.client_info
        });
      }
    );
  }

  get refresh_user_authorization() {
    return augmentAPICall(
      function refresh_user_authorization({
        grant_type = 'refresh_token',
        refresh_token
        }) {
        return this._axios.post('/oauth/token', {
          ...arguments[0],
          ...this.client_info
        });
      }
    );
  }

  get get_client_access_token() {
    return augmentAPICall(
      function get_client_access_token({
        grant_type = 'client_credentials'
        }) {
        return this._axios.post('/oauth/token', {
          ...arguments[0],
          ...this.client_info
        });
      }
    );
  }

  /**
   * ========  APPLICATION  ======
   */

  get get_application() {
    return augmentAPICall(
      function get_application(client_token) {
        return this._axios.get('/', getHeader(client_token));
      }
    );
  }

  /**
   * ========  BANKING  ======
   */

  get get_banking() {
    return augmentAPICall(
      function get_banking(access_token, { limit, offset }) {
        return this._axios.get('/banking', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_banking_card() {
    return augmentAPICall(
      function get_banking_card(access_token, id) {
        return this._axios.get(`/banking/card/${id}`, getHeader(access_token));
      }
    );
  }

  get create_banking_card() {
    return augmentAPICall(
      function create_banking_card(access_token, {
        label,
        name,
        number,
        month,
        year,
        cvv,
        postal
        }) {
        return this._axios.post('/banking/card', arguments[1], getHeader(access_token));
      }
    );
  }

  get update_banking_card() {
    return augmentAPICall(
      function update_banking_card (access_token, id, {
        label,
        month,
        year,
        cvv,
        postal
        }) {
        return this._axios.put(`/banking/card/${id}`, arguments[2], getHeader(access_token))
      }
    );
  }

  get disable_banking_card() {
    return augmentAPICall(
      function disable_banking_card (access_token, id) {
        return this._axios.post(`/banking/card/${id}/disable`, {}, getHeader(access_token));
      }
    );
  }

  get get_banking_account() {
    return augmentAPICall(
      function get_banking_account (access_token, id) {
        return this._axios.get(`/banking/account/${id}`, getHeader(access_token));
      }
    );
  }

  get link_banking_accounts() {
    return augmentAPICall(
      function link_banking_accounts (access_token, {
        username,
        password,
        instituation,
        pin
        }) {
        return this._axios.post('/banking/account/link', arguments[1], getHeader(access_token))
      }
    );
  }

  get link_mfa_banking_accounts() {
    return augmentAPICall(
      function link_mfa_banking_accounts (access_token, {
        answer,
        selections,
        code,
        sendMethodMask
        }) {
        return this._axios.post('/banking/account/link/step', arguments[1], getHeader(access_token))
      }
    );
  }

  get update_banking_account() {
    return augmentAPICall(
      function update_banking_account (access_token, id, {
        label
        }) {
        return this._axios.put(`/banking/account/${id}`, arguments[2], getHeader(access_token))
      }
    );
  }

  get disable_banking_account() {
    return augmentAPICall(
      function disable_banking_account (access_token, id) {
        return this._axios.post(`/banking/account/${id}/disable`, {}, getHeader(access_token));
      }
    );
  }

  /**
   * ========  Identity  ======
   */

  get list_identities() {
    return augmentAPICall(
      function list_identities (access_token, { limit, offset }) {
        return this._axios.get('/identity', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_identity_info() {
    return augmentAPICall(
      function get_identity_info (access_token, id) {
        return this._axios.get(`/identity/info/${id}`, getHeader(access_token));
      }
    );
  }

  get create_identity_info() {
    return augmentAPICall(
      function create_identity_info (access_token, {
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
        return this._axios.post(`/identity/info/`, arguments[1], getHeader(access_token));
      }
    );
  }

  get get_identity_document() {
    return augmentAPICall(
      function get_identity_document (access_token, id) {
        return this._axios.get(`/identity/document/${id}`, getHeader(access_token));
      }
    );
  }

  get create_identity_document() {
    return augmentAPICall(
      function create_identity_document (access_token, {
        file,
        type
        }) {
        return this._axios.post('/identity/document', arguments[1], getHeader(access_token));
      }
    );
  }

  get get_identity_social_network() {
    return augmentAPICall(
      function get_identity_social_network (access_token, id) {
        return this._axios.get(`/identity/social/${id}`, getHeader(access_token));
      }
    );
  }

  get create_identity_social_network() {
    return augmentAPICall(
      function create_identity_social_network (access_token, {
        token,
        type
        }) {
        return this._axios.post('/identity/social', arguments[1], getHeader(access_token));
      }
    );
  }

  get get_identity_business() {
    return augmentAPICall(
      function get_identity_business (access_token, id) {
        return this._axios.get(`/identity/business/${id}`, getHeader(access_token));
      }
    );
  }

  get create_identity_business() {
    return augmentAPICall(
      function create_identity_business (access_token, {
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
        return this._axios.post('/identity/business', arguments[1], getHeader(access_token));
      }
    );
  }

  /**
   * ========  TRANSFER  ======
   */

  get list_transfers() {
    return augmentAPICall(
      function list_transfers (access_token, { limit, offset }) {
        return this._axios.get('/transfer', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_transfer() {
    return augmentAPICall(
      function get_transfer (access_token, id) {
        return this._axios.get(`/transfer/${id}`, getHeader(access_token));
      }
    );
  }

  get create_transfer() {
    return augmentAPICall(
      function create_transfer (access_token, {
        amount,
        phone,
        userId,
        bankingId,
        invoiceId,
        memo,
        mode
        }) {
        return this._axios.post(`/transfer`, arguments[1], getHeader(access_token));
      }
    );
  }

  get capture_transfer() {
    return augmentAPICall(
      function capture_transfer (access_token, id, {
        amount
        }) {
        return this._axios.post(`/transfer/${id}/capture`, arguments[2], getHeader(access_token));
      }
    );
  }

  get refund_transfer() {
    return augmentAPICall(
      function refund_transfer (access_token, id, {
        amount,
        memo
        }) {
        return this._axios.post(`/transfer/${id}/refund`, arguments[2], getHeader(access_token));
      }
    );
  }

  get void_transfer() {
    return augmentAPICall(
      function void_transfer (access_token, id) {
        return this._axios.post(`/transfer/${id}/void`, {}, getHeader(access_token));
      }
    );
  }


  /**
   * ========  USER  ======
   */

  get get_public_user() {
    return augmentAPICall(
      function get_public_user (client_token, userIdOrPhoneE164) {
        return this._axios.get(`/user/${userIdOrPhoneE164}`, getHeader(client_token));
      }
    );
  }

  get get_user() {
    return augmentAPICall(
      function get_user (access_token) {
        return this._axios.get(`/user`, getHeader(access_token));
      }
    );
  }

  /**
   * ========  SUBSCRIPTION ======
   */

  get list_subscription() {
    return augmentAPICall(
      function list_subscription (access_token, { limit, offset }) {
        return this._axios.get('/subscription', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_subscription() {
    return augmentAPICall(
      function get_subscription (access_token, id) {
        return this._axios.get(`/subscription/${id}`, getHeader(access_token));
      }
    );
  }

  get create_subscription() {
    return augmentAPICall(
      function create_subscription (access_token, {
        bankingId,
        planId
        }) {
        return this._axios.post('/subscription', arguments[1], getHeader(access_token));
      }
    );
  }

  get update_subscription() {
    return augmentAPICall(
      function update_subscription (access_token, id, {
        bankingId,
        planId
        }) {
        return this._axios.put(`/subscription/${id}`, arguments[2], getHeader(access_token));
      }
    );
  }

  get cancel_subscription() {
    return augmentAPICall(
      function cancel_subscription (access_token, id) {
        return this._axios.post(`/subscription/${id}/cancel`, {}, getHeader(access_token));
      }
    );
  }

  /**
   * ========  PLAN  ======
   */

  get list_plan() {
    return augmentAPICall(
      function list_plan (access_token, { limit, offset }) {
        return this._axios.get('/plan', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_public_plan() {
    return augmentAPICall(
      function get_public_plan (client_token, id) {
        return this._axios.get(`/plan/${id}`, getHeader(client_token));
      }
    );
  }

  get get_plan() {
    return augmentAPICall(
      function get_plan (access_token, id) {
        return this._axios.get(`/plan/${id}`, getHeader(access_token));
      }
    );
  }

  get create_plan() {
    return augmentAPICall(
      function create_plan (access_token, {
        name,
        amount,
        interval,
        cycles,
        memo,
        callback
        }) {
        return this._axios.post('/plan', arguments[1], getHeader(access_token));
      }
    );
  }

  get update_plan() {
    return augmentAPICall(
      function update_plan (access_token, id, {
        name,
        memo,
        callback
        }) {
        return this._axios.put(`/plan/${id}`, arguments[2], getHeader(access_token));
      }
    );
  }

  get disable_plan() {
    return augmentAPICall(
      function disable_plan (access_token, id) {
        return this._axios.post(`/plan/${id}/disable`, {}, getHeader(access_token));
      }
    );
  }

  /**
   * ========  INVOICE  ======
   */

  get list_invoice() {
    return augmentAPICall(
      function list_invoice (access_token, { limit, offset }) {
        return this._axios.get('/invoice', {
          ...getHeader(access_token),
          params: Object.assign({}, arguments[1])
        });
      }
    );
  }

  get get_public_invoice() {
    return augmentAPICall(
      function get_public_invoice (client_token, id) {
        return this._axios.get(`/invoice/${id}`, getHeader(client_token));
      }
    );
  }

  get get_invoice() {
    return augmentAPICall(
      function get_invoice (access_token, id) {
        return this._axios.get(`/invoice/${id}`, getHeader(access_token));
      }
    );
  }

  get create_invoice() {
    return augmentAPICall(
      function create_invoice (access_token, {
        description,
        amount,
        invoiceDate,
        dueDate,
        reference,
        note,
        memo,
        terms
        }) {
        return this._axios.post('/invoice', arguments[1], getHeader(access_token));
      }
    );
  }

  get update_invoice() {
    return augmentAPICall(
      function update_invoice (access_token, id, {
        reference,
        memo
        }) {
        return this._axios.put(`/invoice/${id}`, arguments[2], getHeader(access_token));
      }
    );
  }

  get cancel_invoice() {
    return augmentAPICall(
      function cancel_invoice (access_token, id) {
        return this._axios.post(`/invoice/${id}/cancel`, {}, getHeader(access_token));
      }
    );
  }
}


