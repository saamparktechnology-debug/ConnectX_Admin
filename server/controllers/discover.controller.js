const discoverQueries = require('../queries/discover.queries');
const userQueries = require('../queries/user.queries');

exports.getDiscoverUsers = async (req, res) => {
  try {
    const preferences = await userQueries.getUserPreferences(req.userId);
    const profile = await userQueries.getUserProfile(req.userId);
    const users = await userQueries.getSwipeableUsers(
      req.userId, preferences,
      profile?.location_lat, profile?.location_lng
    );

    const processedUsers = users.map(user => {
      const age = user.date_of_birth ?
        Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
      const photos = user.photos ? user.photos.split(',') : [];
      const interests = user.interests ? user.interests.split(',') : [];
      return {
        id: user.id, name: user.name, age, bio: user.bio, city: user.city,
        occupation: user.occupation, height: user.height, primary_photo: user.primary_photo,
        is_verified: user.is_verified, is_premium: user.is_premium,
        photos, interests
      };
    });

    res.json({ success: true, data: { users: processedUsers } });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.swipe = async (req, res) => {
  try {
    const { swipedId, action } = req.body;
    if (!swipedId || !action) {
      return res.status(400).json({ success: false, message: 'swipedId and action are required.' });
    }
    if (!['like', 'dislike', 'super_like'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    await discoverQueries.createSwipe(req.userId, swipedId, action);

    if (action === 'like' || action === 'super_like') {
      const isMutual = await discoverQueries.checkMutualLike(req.userId, swipedId);
      if (isMutual) {
        const match = await discoverQueries.createMatch(req.userId, swipedId);
        const matchedUser = await userQueries.getUserProfile(swipedId);
        const myProfile = await userQueries.getUserProfile(req.userId);

        const io = req.app.get('io');
        if (io) {
          io.to(`user_${swipedId}`).emit('new_match', {
            match,
            matchedUser: {
              id: req.userId, name: myProfile.name,
              primary_photo: myProfile.primary_photo
            }
          });
          io.to(`user_${req.userId}`).emit('new_match', {
            match,
            matchedUser: {
              id: swipedId, name: matchedUser.name,
              primary_photo: matchedUser.primary_photo
            }
          });
        }

        return res.json({
          success: true,
          data: { matched: true, match }
        });
      }
    }

    if (action === 'like' || action === 'super_like') {
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${swipedId}`).emit('new_like', {
          from: req.userId,
          action
        });
      }
    }

    res.json({ success: true, data: { matched: false } });
  } catch (error) {
    console.error('Swipe error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ success: true, data: { matched: false, alreadySwiped: true } });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getWhoLikedYou = async (req, res) => {
  try {
    const likes = await discoverQueries.getWhoLikedYou(req.userId);
    const processed = likes.map(user => {
      const age = user.date_of_birth ?
        Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
      const photos = user.photos ? user.photos.split(',') : [];
      return { ...user, age, photos };
    });
    res.json({ success: true, data: { likes: processed } });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await discoverQueries.getUserMatches(req.userId);
    res.json({ success: true, data: { matches } });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.unmatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    await discoverQueries.unmatch(parseInt(matchId), req.userId);
    res.json({ success: true, message: 'Unmatched successfully.' });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
