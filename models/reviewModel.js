const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //this  prevents duplicates by making the combination of the user and the tour unique to prevent more than one review from a single user
reviewSchema.pre(/^find/, function(next) {
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name'
  // });

  this.populate({ path: 'user', select: 'name photo' });

  next();
});

//static methods
//static method that get the avg rating and number of reviews for a particular tour
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //this points to the model
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, //add one for each tour that is rated }
        avgRating: { $avg: '$rating' } //get you the average
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  //we use post because all the documents are saved and the post middleware doesnt get access to next
  //this will point to current review
  //this.constructor points to the model Review
  this.constructor.calcAverageRatings(this.tour); //this.tour is the current tour id
});

//updating the stats when a review is made
//keep in mind that findByIdAndUpdate and findByIdAndDelete are actually short hand for findOneAnd...
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); //returns review document
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  //awawit this.findOne doesnt work here  coz the query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
module.exports = mongoose.model('Review', reviewSchema);
