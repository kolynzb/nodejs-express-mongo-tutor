const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  getUserById,
} = require('../controllers/userController');

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
