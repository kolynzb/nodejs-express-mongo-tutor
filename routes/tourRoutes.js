const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { getAllTours, createTour, getTourById, updateTour, deleteTour } =
  tourController;

router.param('id', (req, res, next, val) => {
  console.log(`param of ${val}`);
  next();
});
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);
module.exports = router;
