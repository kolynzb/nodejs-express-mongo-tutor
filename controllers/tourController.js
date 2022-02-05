const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.checkBody = (req, res, next) => {
  console.log(`body has been checked`);
  next();
};
//api aliasing
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { tour: newTour } });
});

exports.getAllTours = catchAsync(async (req, res) => {
  //query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour)
    return next(new AppError(`No tour found with id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedTour)
    return next(new AppError(`No tour found with id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    data: { tour: updatedTour }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour)
    return next(new AppError(`No tour found with id ${req.params.id}`, 404));

  res.status(204).json({
    status: 'success',
    message: 'Tour was successfully deleted'
  });
});

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
