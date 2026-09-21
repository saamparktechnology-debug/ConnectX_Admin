const axios = require('axios');
const crypto = require('crypto');

const CF_APP_ID = process.env.CASHFREE_APP_ID;
const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CF_ENV = process.env.CASHFREE_ENV || 'production';

const PG_BASE = CF_ENV === 'sandbox'
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

const API_VERSION = '2022-09-01';

const pgClient = axios.create({
  baseURL: PG_BASE,
  headers: {
    'x-client-id': CF_APP_ID,
    'x-client-secret': CF_SECRET_KEY,
    'x-api-version': API_VERSION,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const createOrder = async (orderId, amount, userId, customerPhone, returnUrl) => {
  try {
    const response = await pgClient.post('/orders', {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `CX_${userId}`,
        customer_phone: customerPhone || '9999999999',
      },
      order_meta: {
        return_url: returnUrl || `connectx://payment?order_id=${orderId}`,
      },
      order_note: `ConnectX Recharge - ₹${amount}`,
    });
    return response.data;
  } catch (error) {
    console.error('Cashfree createOrder error:', error.response?.data || error.message);
    throw error;
  }
};

const getOrderStatus = async (orderId) => {
  try {
    const response = await pgClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Cashfree getOrderStatus error:', error.response?.data || error.message);
    throw error;
  }
};

const getOrderPayments = async (orderId) => {
  try {
    const response = await pgClient.get(`/orders/${orderId}/payments`);
    return response.data;
  } catch (error) {
    console.error('Cashfree getOrderPayments error:', error.response?.data || error.message);
    throw error;
  }
};

const verifyWebhookSignature = (rawBody, signature, timestamp) => {
  try {
    const signedPayload = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', CF_SECRET_KEY)
      .update(signedPayload)
      .digest('base64');
    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return false;
  }
};

module.exports = {
  createOrder,
  getOrderStatus,
  getOrderPayments,
  verifyWebhookSignature,
  CF_ENV,
};
