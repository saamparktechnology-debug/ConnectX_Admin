const cashfree = require('../helpers/cashfree');
const paymentQueries = require('../queries/payment.queries');

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

    if (amount < 10) {
      return res.status(400).json({ success: false, message: 'Minimum recharge amount is ₹10.' });
    }

    const orderId = `CX_${req.userId}_${Date.now()}`;
    const returnUrl = `connectx://payment?order_id=${orderId}`;

    const cfResponse = await cashfree.createOrder(
      orderId,
      amount,
      req.userId,
      req.userPhone || '9999999999',
      returnUrl
    );

    await paymentQueries.createCfOrder(
      req.userId,
      cfResponse.cf_order_id,
      orderId,
      amount
    );

    res.json({
      success: true,
      data: {
        cf_order_id: cfResponse.cf_order_id,
        payment_session_id: cfResponse.payment_sessions?.[0]?.payment_session_id,
        order_id: orderId,
        amount: amount,
      },
    });
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create payment order.',
    });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await paymentQueries.getCfOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.payment_status === 'PAID') {
      return res.json({
        success: true,
        data: {
          order_id: order.order_id,
          payment_status: 'PAID',
          amount: order.amount,
          payment_method: order.payment_method,
        },
      });
    }

    const cfStatus = await cashfree.getOrderStatus(orderId);
    const cfOrderStatus = cfStatus.order_status;

    if (cfOrderStatus === 'PAID' && order.payment_status !== 'PAID') {
      const payments = await cashfree.getOrderPayments(orderId);
      const payment = payments?.[0];

      await paymentQueries.updateCfOrderStatus(
        orderId,
        'PAID',
        payment?.cf_payment_id,
        payment?.payment_method
      );

      await paymentQueries.creditWallet(order.user_id, order.amount, orderId);

      return res.json({
        success: true,
        data: {
          order_id: order.order_id,
          payment_status: 'PAID',
          amount: order.amount,
          payment_method: payment?.payment_method,
        },
      });
    }

    if (cfOrderStatus === 'EXPIRED' || cfOrderStatus === 'TERMINATED') {
      await paymentQueries.updateCfOrderStatus(orderId, 'FAILED', null, null);
    }

    res.json({
      success: true,
      data: {
        order_id: order.order_id,
        payment_status: cfOrderStatus || order.payment_status,
        amount: order.amount,
      },
    });
  } catch (error) {
    console.error('Get order status error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to get order status.',
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody;
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    if (signature && timestamp && rawBody) {
      const isValid = cashfree.verifyWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.warn('Webhook signature verification failed');
      }
    }

    const payload = req.body;
    const orderId = payload.order_id;
    const orderStatus = payload.order_status;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing order_id' });
    }

    const order = await paymentQueries.getCfOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus === 'PAID' && order.payment_status !== 'PAID') {
      const payment = payload.payment?.[0];
      await paymentQueries.updateCfOrderStatus(
        orderId,
        'PAID',
        payment?.cf_payment_id,
        payment?.payment_method
      );
      await paymentQueries.creditWallet(order.user_id, order.amount, orderId);
      console.log(`Webhook: Wallet credited for order ${orderId}, amount ₹${order.amount}`);
    }

    if (orderStatus === 'EXPIRED' || orderStatus === 'TERMINATED') {
      await paymentQueries.updateCfOrderStatus(orderId, 'FAILED', null, null);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
