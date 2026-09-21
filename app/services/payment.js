import api from './api';

export const createPaymentOrder = async (amount) => {
  const res = await api.post('/payment/create-order', { amount });
  return res.data.data;
};

export const getPaymentOrderStatus = async (orderId) => {
  const res = await api.get(`/payment/order-status/${orderId}`);
  return res.data.data;
};
