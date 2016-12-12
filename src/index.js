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

  _updateBearer ({ access_token}) {
    if (!access_token) return;
    this._axios.defaults.headers.common.Authorization =  `Bearer ${access_token}`;
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
        this._updateBearer({ access_token: client_token });
        return this._axios.post('/oauth', {
          ...arguments[1]
        });
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

  get get_appication() {
    return this.augmentAPICall(
      function get_appication(client_token) {
        this._updateBearer({ access_token: client_token });
        return this._axios.get('/');
      }
    );
  }

  /**
   * ========  BANKING  ======
   */

  get get_banking() {
    return this.augmentAPICall(
      function get_banking(access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/banking', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_banking_card() {
    return this.augmentAPICall(
      function get_banking_card(access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/banking/card/${id}`);
      }
    );
  }

  get create_banking_card() {
    return this.augmentAPICall(
      function create_banking_card(access_token, {
        label,
        name,
        number,
        month,
        year,
        cvv,
        postal
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/banking/card', arguments[0]);
      }
    );
  }

  get update_banking_card() {
    return this.augmentAPICall(
      function update_banking_card (access_token, id, {
        label,
        month,
        year,
        cvv,
        postal
        }) {
        this._updateBearer({ access_token });
        return this._axios.put(`/banking/card/${id}`, arguments[1])
      }
    );
  }

  get disable_banking_card() {
    return this.augmentAPICall(
      function disable_banking_card (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.post(`/banking/card/${id}/disable`);
      }
    );
  }

  get get_banking_account() {
    return this.augmentAPICall(
      function get_banking_account (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.put(`/banking/account/${id}`);
      }
    );
  }

  get link_banking_accounts() {
    return this.augmentAPICall(
      function link_banking_accounts (access_token, {
        username,
        password,
        instituation,
        pin
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/banking/account/link', arguments[0])
      }
    );
  }

  get link_mfa_banking_accounts() {
    return this.augmentAPICall(
      function link_mfa_banking_accounts (access_token, {
        answer,
        selections,
        code,
        sendMethodMask
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/banking/account/link/step', arguments[0])
      }
    );
  }

  get update_banking_account() {
    return this.augmentAPICall(
      function update_banking_account (access_token, id, {
        label
        }) {
        this._updateBearer({ access_token });
        return this._axios.put(`/banking/account/${id}`, arguments[1])
      }
    );
  }

  get disable_banking_account() {
    return this.augmentAPICall(
      function disable_banking_account (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.put(`/banking/account/${id}/disable`);
      }
    );
  }

  /**
   * ========  Identity  ======
   */

  get list_identities() {
    return this.augmentAPICall(
      function list_identities (access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/identity', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_identity_info() {
    return this.augmentAPICall(
      function get_identity_info (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/identity/info/${id}`);
      }
    );
  }

  get create_identity_info() {
    return this.augmentAPICall(
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
        this._updateBearer({ access_token });
        return this._axios.post(`/identity/info/`, arguments[0]);
      }
    );
  }

  get get_identity_document() {
    return this.augmentAPICall(
      function get_identity_document (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/identity/document/${id}`);
      }
    );
  }

  get create_identity_document() {
    return this.augmentAPICall(
      function create_identity_document (access_token, {
        file,
        type
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/identity/document', arguments[0]);
      }
    );
  }

  get get_identity_social_network() {
    return this.augmentAPICall(
      function get_identity_social_network (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/identity/social/${id}`);
      }
    );
  }

  get create_identity_social_network() {
    return this.augmentAPICall(
      function create_identity_social_network (access_token, {
        token,
        type
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/identity/social', arguments[0]);
      }
    );
  }

  get get_identity_business() {
    return this.augmentAPICall(
      function get_identity_business (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/identity/business/${id}`);
      }
    );
  }

  get create_identity_business() {
    return this.augmentAPICall(
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
        this._updateBearer({ access_token });
        return this._axios.post('/identity/business', arguments[0]);
      }
    );
  }

  /**
   * ========  TRANSFER  ======
   */

  get list_transfers() {
    return this.augmentAPICall(
      function list_transfers (access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/transfer', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_transfer() {
    return this.augmentAPICall(
      function get_transfer (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/transfer/${id}`);
      }
    );
  }

  get create_transfer() {
    return this.augmentAPICall(
      function create_transfer (access_token, {
        amount,
        phone,
        userId,
        bankingId,
        invoiceId,
        memo,
        mode
        }) {
        this._updateBearer({ access_token });
        return this._axios.post(`/transfer`);
      }
    );
  }

  get capture_transfer() {
    return this.augmentAPICall(
      function capture_transfer (access_token, id, {
        amount
        }) {
        this._updateBearer({ access_token });
        return this._axios.post(`/transfer/${id}/capture`, arguments[1]);
      }
    );
  }

  get refund_transfer() {
    return this.augmentAPICall(
      function refund_transfer (access_token, id, {
        amount,
        memo
        }) {
        this._updateBearer({ access_token });
        return this._axios.post(`/transfer/${id}/refund`, arguments[1]);
      }
    );
  }

  get void_transfer() {
    return this.augmentAPICall(
      function void_transfer (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.post(`/transfer/${id}/void`);
      }
    );
  }


  /**
   * ========  USER  ======
   */

  get get_public_user() {
    return this.augmentAPICall(
      function get_public_user (client_token, id, {
        userId,
        phoneE164
        }) {
        this._updateBearer({ access_token: client_token });
        return this._axios.get(`/user/${id}`, {
          params: Object.assign({}, arguments[1])
        })
      }
    );
  }

  get get_user() {
    return this.augmentAPICall(
      function get_user (access_token) {
        this._updateBearer({ access_token });
        return this._axios.get(`/user`);
      }
    );
  }

  /**
   * ========  SUBSCRIPTION ======
   */

  get list_subscription() {
    return this.augmentAPICall(
      function list_subscription (access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/subscription', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_subscription() {
    return this.augmentAPICall(
      function get_subscription (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/subscription/${id}`);
      }
    );
  }

  get create_subscription() {
    return this.augmentAPICall(
      function create_subscription (access_token, {
        bankingId,
        planId
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/subscription', arguments[0]);
      }
    );
  }

  get update_subscription() {
    return this.augmentAPICall(
      function update_subscription (access_token, id, {
        bankingId,
        planId
        }) {
        this._updateBearer({ access_token });
        return this._axios.put(`/subscription/${id}`, arguments[1]);
      }
    );
  }

  get cancel_subscription() {
    return this.augmentAPICall(
      function cancel_subscription (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.post(`/subscription/${id}/cancel`);
      }
    );
  }

  /**
   * ========  PLAN  ======
   */

  get list_plan() {
    return this.augmentAPICall(
      function list_plan (access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/plan', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_public_plan() {
    return this.augmentAPICall(
      function get_public_plan (client_token, id) {
        this._updateBearer({ access_token: client_token });
        return this._axios.get(`/plan/${id}`);
      }
    );
  }

  get get_plan() {
    return this.augmentAPICall(
      function get_plan (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/plan/${id}`);
      }
    );
  }

  get create_plan() {
    return this.augmentAPICall(
      function create_plan (access_token, {
        name,
        amount,
        interval,
        cycles,
        memo,
        callback
        }) {
        this._updateBearer({ access_token });
        return this._axios.post('/plan', arguments[0]);
      }
    );
  }

  get update_plan() {
    return this.augmentAPICall(
      function update_plan (access_token, id, {
        name,
        memo,
        callback
        }) {
        this._updateBearer({ access_token });
        return this._axios.put(`/plan/${id}`, arguments[1]);
      }
    );
  }

  get disable_plan() {
    return this.augmentAPICall(
      function disable_plan (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.post(`/plan/${id}/disable`);
      }
    );
  }

  /**
   * ========  INVOICE  ======
   */

  get list_invoice() {
    return this.augmentAPICall(
      function list_invoice (access_token, { limit, offset }) {
        this._updateBearer({ access_token });
        return this._axios.get('/invoice', {
          params: Object.assign({}, arguments[0])
        });
      }
    );
  }

  get get_public_invoice() {
    return this.augmentAPICall(
      function get_public_invoice (client_token, id) {
        this._updateBearer({ access_token: client_token });
        return this._axios.get(`/invoice/${id}`);
      }
    );
  }

  get get_invoice() {
    return this.augmentAPICall(
      function get_invoice (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.get(`/invoice/${id}`);
      }
    );
  }

  get create_invoice() {
    return this.augmentAPICall(
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
        this._updateBearer({ access_token });
        return this._axios.post('/invoice', arguments[0]);
      }
    );
  }

  get update_invoice() {
    return this.augmentAPICall(
      function update_invoice (access_token, id, {
        reference,
        memo
        }) {
        this._updateBearer({ access_token });
        return this._axios.put(`/invoice/${id}`, arguments[1]);
      }
    );
  }

  get cancel_invoice() {
    return this.augmentAPICall(
      function cancel_invoice (access_token, id) {
        this._updateBearer({ access_token });
        return this._axios.post(`/invoice/${id}/cancel`);
      }
    );
  }
}


