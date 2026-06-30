const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, deleteUser, promoteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/promote', promoteUser);

module.exports = router;
