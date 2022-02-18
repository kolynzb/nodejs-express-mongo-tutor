const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //merge params gives this route access to the tour id in the tour routes

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourAndUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;
