const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
  updateMe,
  getUserById,
  getMe,
  deleteMe
} = require('../controllers/userController');
const authController = require('../controllers/authController');

router.get('/me', authController.protect, getMe, getUserById);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
); //use patch coz we are manipulating the user document
router.delete('/deleteMe', authController.protect, deleteMe); //used for deactivating the user

router.patch('/updateMe', authController.protect, updateMe);
router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
