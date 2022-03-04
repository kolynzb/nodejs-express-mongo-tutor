const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const viewsController = require('../controllers/viewsController');

router.get(
  '/',
  createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
module.exports = router;
