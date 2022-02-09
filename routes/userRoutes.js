const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  getUserById
} = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
