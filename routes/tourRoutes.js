const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();
const { getTourById, updateTour, deleteTour } = tourController;

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

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
