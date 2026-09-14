const queries = require('../queries/femaleEarnings.queries');
const { sendPushNotification } = require('../helpers/push');

exports.getFemaleEarningsOverview = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await queries.getFemaleEarningsOverview(
      parseInt(page) || 1, parseInt(limit) || 20, search || ''
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get female earnings overview error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getFemaleEarningsDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await queries.getFemaleEarningsDetail(parseInt(userId));
    if (!result.user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get female earnings detail error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getBonusRules = async (req, res) => {
  try {
    const { page, limit, female_user_id } = req.query;
    const result = await queries.getBonusRules(
      parseInt(page) || 1, parseInt(limit) || 20,
      female_user_id ? parseInt(female_user_id) : null
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get bonus rules error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.createBonusRule = async (req, res) => {
  try {
    const { female_user_id, title, target_minutes, bonus_amount, validity_days } = req.body;
    if (!female_user_id || !target_minutes || !bonus_amount || !validity_days) {
      return res.status(400).json({ success: false, message: 'female_user_id, target_minutes, bonus_amount, and validity_days are required.' });
    }

    const ruleId = await queries.createBonusRule({
      female_user_id, title, target_minutes, bonus_amount, validity_days
    });

    const rule = await queries.getBonusRuleById(ruleId);

    await sendPushNotification(
      female_user_id,
      'New Bonus Offer!',
      `Talk for ${target_minutes} minutes in ${validity_days} days and earn ₹${bonus_amount} bonus! Accept now.`,
      { type: 'bonus_offer', ruleId }
    );

    res.status(201).json({ success: true, message: 'Bonus rule created.', data: { rule } });
  } catch (error) {
    console.error('Create bonus rule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateBonusRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await queries.updateBonusRule(parseInt(id), req.body);
    if (!updated) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }
    const rule = await queries.getBonusRuleById(parseInt(id));
    res.json({ success: true, message: 'Bonus rule updated.', data: { rule } });
  } catch (error) {
    console.error('Update bonus rule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.deleteBonusRule = async (req, res) => {
  try {
    const { id } = req.params;
    await queries.deleteBonusRule(parseInt(id));
    res.json({ success: true, message: 'Bonus rule deleted.' });
  } catch (error) {
    console.error('Delete bonus rule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.acceptBonusRule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const rule = await queries.getBonusRuleById(parseInt(id));
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Bonus rule not found.' });
    }
    if (rule.female_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not your offer.' });
    }
    if (rule.is_accepted) {
      return res.status(400).json({ success: false, message: 'Already accepted.' });
    }

    await queries.updateBonusRule(parseInt(id), {
      is_accepted: true,
      accepted_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });

    res.json({ success: true, message: 'Bonus offer accepted!' });
  } catch (error) {
    console.error('Accept bonus rule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getMyEarnings = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await queries.getFemaleEarningsDetail(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get my earnings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getMyBonusRules = async (req, res) => {
  try {
    const userId = req.userId;
    const bonuses = await queries.getFemaleActiveBonuses(userId);
    const pendingOffers = await queries.getBonusRules(1, 50, userId);
    const unaccepted = pendingOffers.rules.filter(r => !r.is_accepted && r.end_date >= new Date().toISOString().slice(0, 10));
    res.json({ success: true, data: { activeBonuses: bonuses, pendingOffers: unaccepted } });
  } catch (error) {
    console.error('Get my bonus rules error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getAdminRevenue = async (req, res) => {
  try {
    const result = await queries.getAdminRevenue();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get admin revenue error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
