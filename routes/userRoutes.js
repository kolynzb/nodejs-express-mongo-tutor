const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  updateMe,
  getUserById,
  deleteMe
} = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
); //use patch coz we are manipulating the user document

router.patch('/updateMe', authController.protect, updateMe);
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
