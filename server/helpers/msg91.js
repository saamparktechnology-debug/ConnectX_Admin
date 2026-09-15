const axios = require('axios');

const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;
const MSG91_WIDGET_ID = process.env.MSG91_WIDGET_ID;
console.log('MSG91_AUTHKEY:', MSG91_AUTHKEY ? MSG91_AUTHKEY.substring(0, 8) + '...' : 'MISSING');
console.log('MSG91_WIDGET_ID:', MSG91_WIDGET_ID || 'MISSING');

const extractRequestId = (responseData) => {
  if (!responseData) return null;
  if (responseData.request_id) return String(responseData.request_id);
  if (responseData.requestId) return String(responseData.requestId);
  if (responseData.data && responseData.data.request_id) return String(responseData.data.request_id);
  if (responseData.data && responseData.data.requestId) return String(responseData.data.requestId);
  return null;
};

const sendOtp = async (phone) => {
  console.log(`Sending OTP to ${phone} via MSG91 Widget sendOtp API`);

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/widget/sendOtp',
      {
        widgetId: MSG91_WIDGET_ID,
        identifier: `91${phone}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTHKEY,
        },
      }
    );

    console.log('MSG91 sendOtp full response:', JSON.stringify(response.data));
    const requestId = extractRequestId(response.data);
    console.log('Extracted requestId:', requestId);

    if (!requestId) {
      console.warn('No requestId found in MSG91 response. Response keys:', Object.keys(response.data || {}));
    }

    return { success: true, requestId: requestId || null };
  } catch (error) {
    console.log('MSG91 sendOtp failed:', JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

const verifyOtp = async (phone, otp, requestId) => {
  console.log(`Verifying OTP for ${phone}, requestId: ${requestId}, otp: ${otp}`);

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/widget/verifyOtp',
      {
        widgetId: MSG91_WIDGET_ID,
        reqId: String(requestId),
        otp: String(otp),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTHKEY,
        },
      }
    );

    console.log('MSG91 verifyOtp full response:', JSON.stringify(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    console.log('MSG91 verifyOtp failed:', JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

const retryOtp = async (phone, requestId) => {
  console.log(`Retrying OTP for ${phone}, requestId: ${requestId}`);

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/widget/retryOtp',
      {
        widgetId: MSG91_WIDGET_ID,
        reqId: String(requestId),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTHKEY,
        },
      }
    );

    console.log('MSG91 retryOtp full response:', JSON.stringify(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    console.log('MSG91 retryOtp failed:', JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

module.exports = { sendOtp, verifyOtp, retryOtp };
