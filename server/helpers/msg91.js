const axios = require('axios');

const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;
const MSG91_WIDGET_ID = process.env.MSG91_WIDGET_ID;
const MSG91_TOKEN_AUTH = process.env.MSG91_TOKEN_AUTH;
console.log('MSG91_AUTHKEY:', MSG91_AUTHKEY ? MSG91_AUTHKEY.substring(0, 8) + '...' : 'MISSING');
console.log('MSG91_WIDGET_ID:', MSG91_WIDGET_ID || 'MISSING');

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOtp = async (phone) => {
  const otp = generateOtp();
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

    console.log('MSG91 Widget sendOtp response:', JSON.stringify(response.data));
    return { success: true, otp, requestId: response.data.request_id };
  } catch (error) {
    console.log('MSG91 Widget sendOtp failed:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendOtp };
