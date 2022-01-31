const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();
const { getTourById, updateTour, deleteTour } = tourController;

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);
module.exports = router;
