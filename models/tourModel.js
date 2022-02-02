const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema( //takes in two objects the schema defination and the schema options
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [50, 'must be at most 50 characters'],
      minLength: [10, 'must be atleast most 50 characters']
      //,validate: [validator.isAlpha, 'Title must contain only characters']
    },
    slug: {
      type: String
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Group Size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messages: 'difficulty is either easy  medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE}) should be below the regular Price',
        validator: function(val) {
          // this validator only works on new document
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a Summary ']
    },
    decription: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a Cover Image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } //the toobject properties telll mongoose to output virtual properties when qeured
);

//virtual properties are values that are not  persisted in the database for instance the duration in weeks  which is derived from the duration in days
tourSchema.virtual('durationWeeks').get(function() {
  //used a normal function because arrow functions dont have access to the this key word
  return this.duration / 7;
});

//document middleware that runs before the .save() and .create() methods but not on .insertMany()
//the this keyword here refers to the document that is being saved
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//post middleware  --gives access to the finished document
// tourSchema.post('save', function(doc, next) {
// console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
//is will point to a curtain query
tourSchema.pre(/^find/, function(next) {
  //allstrings that start with find
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourSchema.post(/^find/, function(docs,next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

//AGGREGAATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ secretTour: { $ne: true } });
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
