const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = tourController;

router.param('id', checkId);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);
module.exports = router;
