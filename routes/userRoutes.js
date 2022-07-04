const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
  updateMe,
  getUserById,
  getMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect); //add middleware to the remain routes that require user authenticated

router.get('/me', getMe, getUserById);
router.patch(
  '/updateMyPassword',

  authController.updatePassword
); //use patch coz we are manipulating the user document
router.delete('/deleteMe', authController.protect, deleteMe); //used for deactivating the user

router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe); //photo is the feild where your going to update the image
router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
