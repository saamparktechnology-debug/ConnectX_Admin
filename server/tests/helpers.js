const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateUserToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateAdminToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
};

const randomEmail = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@testconnecto.com`;

const randomPhone = () => `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

module.exports = { generateUserToken, generateAdminToken, randomEmail, randomPhone };
