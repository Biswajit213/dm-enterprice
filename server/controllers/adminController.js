const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, products, orders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.find().select('name numReviews ratings isBestSeller'),
      Order.find().select('totalPrice orderStatus createdAt'),
    ]);

    const revenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);

    // Orders by status
    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const bestSellers = await Product.find({ isBestSeller: true })
      .select('name images price numReviews ratings')
      .limit(5);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalOrders, revenue: Math.round(revenue * 100) / 100, totalProducts: products.length },
      ordersByStatus,
      monthlyOrders,
      bestSellers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote user to admin
// @route   PUT /api/admin/users/:id/promote
exports.promoteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
