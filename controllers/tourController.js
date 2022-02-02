const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: { tour: updatedTour }
    });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'Tour was successfully deleted'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
