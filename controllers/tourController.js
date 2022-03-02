const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); //image stored on a buffer to make calling it easier instead of loading it using fs

//check if file uploaded is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images,', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]); //multiple photos

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //process cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //process other images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.checkBody = (req, res, next) => {
  // console.log(`body has been checked`);
  next();
};
//api aliasing
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({ status: 'success', data: { tour: newTour } });
// });

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res) => {
//   //query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: { tours }
//   });
// });

exports.getTourById = factory.getOne(Tour, { path: 'reviews' });
// exports.getTourById = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour)
//     return next(new AppError(`No tour found with id ${req.params.id}`, 404));

//   res.status(200).json({
//     status: 'success',
//     data: { tour }
//   });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//   if (!updatedTour)
//     return next(new AppError(`No tour found with id ${req.params.id}`, 404));

//   res.status(200).json({
//     status: 'success',
//     data: { tour: updatedTour }
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour)
//     return next(new AppError(`No tour found with id ${req.params.id}`, 404));

//   res.status(204).json({
//     status: 'success',
//     message: 'Tour was successfully deleted'
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } }, //you can match multiple times
    {
      $group: {
        // _id: null, //this is used to group by a particular feild
        //_id: '$difficulty', //group by difficulty
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, //add one for every charater going through the pipeline group
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // sort by average price ascending
    },
    { $limit: 12 } //no of documents to show
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, //splits the document depending on an array
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        } //tours this year
      }
    },
    {
      $group: {
        //want to group them by month
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 }, //a feild that increments and gets the number of tours in a month
        tours: { $push: '$name' } // pushes the tour names into an array
      }
    },
    { $addFields: { month: '$_id' } }, //adds a month field
    { $project: { _id: 0 } }, //removes id field
    { $sort: { numTourStarts: -1 } }
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //to convert distance to radians by divividing y the radius of the earth in either miles or km
  if (!lat || !lng)
    return AppError(
      'Please provide a latitude and longitude in the format latitude,longitude.',
      400
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } //make sure to add an idex to start location in order to qeury geospacial data
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

exports.getDistances = catchAsync(async (req, res) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'ml' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    return AppError(
      'Please provide a latitude and longitude in the format latitude,longitude.',
      400
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] }, //distancefromwitch to calculate
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        //project specifies the fieelds we need
        distance: 1,
        name: 1
      }
    }
  ]); //there is only one geospacial pipeline phase thatis geoNear and make sure atleast one of your feilds has a geospacial index and it shooould come first

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { data: distances }
  });
});
