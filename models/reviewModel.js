const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review Feild is required']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be greater than 1'],
      max: [5, 'Rating must be less than 5']
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      //parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Review', reviewSchema);

reviewSchema.pre(/^find/, function(next) {
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name'
  // });

  this.populate({ path: 'user', select: 'name photo' });

  next();
});
