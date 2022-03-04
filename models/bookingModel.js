const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must Belong to a tour ']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must Belong to a User ']
  },
  price: {
    type: Number,
    required: [true, 'Bookint must have a price']
  },
  paid: {
    type: Boolean,
    default: false
  }
});

//query middleware
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
