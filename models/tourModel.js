const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

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
          // this validator only works on new document on save() and create
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
    },
    //geospatial data defines places on the earth based on longitudes and latitudes coordinates, can also define polygons
    startLocation: {
      //uses a data format called GeoJSON that is sepecified in and object with atleast two properties type and coordinates
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //latitude then the longitude
      address: String,
      description: String
    },
    locations: [
      //creating an embeded document /data set
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }] // child referencing
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } //the toobject properties tells mongoose to output virtual properties when qeuried
);

tourSchema.index({ price: 1 });

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

//for embedding
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//post middleware  --gives access to the finished document
// tourSchema.post('save', function(doc, next) {
// console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
//this will point to a curtain query
tourSchema.pre(/^find/, function(next) {
  //allstrings that start with find
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function(next) {
  //this middle ware will populate and remember in qery middleware this always points to the query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
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

//virtual populate to add reviews to the schema virtually
tourSchema.virtual('reviews', {
  ref: 'Review', //reference to the schema
  foreignField: 'tour', //the feild in which the tour is referencined in the review schema
  localField: '_id' //where the id is stored in the tour model
});

module.exports = mongoose.model('Tour', tourSchema);
