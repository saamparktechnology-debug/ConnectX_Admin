const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

router.post('/create-order', auth, paymentController.createOrder);
router.get('/order-status/:orderId', auth, paymentController.getOrderStatus);

router.post('/webhook', (req, res, next) => {
  req.rawBody = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => { req.rawBody += chunk; });
  req.on('end', () => { next(); });
}, paymentController.handleWebhook);

module.exports = router;
