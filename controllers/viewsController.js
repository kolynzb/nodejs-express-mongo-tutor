const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    feilds: 'review rating user'
  });

  // if (!tour)
  //   return next(
  //     new AppError(`No tour found with slug ${req.params.slug}`, 404)
  //   );

  res.status(200).render('tour', { title: `${tour.name}`, tour });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: `Log into your account` });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: `Your account` });
};

exports.updateUserData = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', { title: 'Your Account', user });
};

exports.getMyTours = async (req, res, next) => {
  //find all booking
  const bookings = await Booking.find({ user: req.user.id });

  //find tours with return ids
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', { title: 'My Tours', tours });
};
