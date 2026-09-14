const express = require('express');
const router = express.Router();
const discoverController = require('../controllers/discover.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, discoverController.getDiscoverUsers);
router.post('/swipe', auth, discoverController.swipe);
router.get('/likes', auth, discoverController.getWhoLikedYou);
router.get('/matches', auth, discoverController.getMatches);
router.delete('/unmatch/:matchId', auth, discoverController.unmatch);

module.exports = router;
