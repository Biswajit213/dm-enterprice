const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    next(error);
  }
};
