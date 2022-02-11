const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  //SECRET STRING MUST BE ATLEAST 36 CHARACTERS LONG also expiration time can be 90d 10h 5m 3s
  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //checking if password and email where added
  if (!email || !password) {
    return next(new AppError('Please Provide an email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);

  res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  //get token and check if its there,
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not loggin In ', 401));
  }

  //token verification ,
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user beloging to the token nolonger exists', 401)
    );
  }
  //check if user has recently changed there password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password', 401));

  //add payload to the req object
  req.user = currentUser;

  //grant access to protected route
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array e.g ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to access this action', 403)
      );
    }
  };
};

exports.forgotPassword = async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`There is no user with email ${req.body.email}`, 404)
    );
  //generate the random reset token
  const resetToken = User.createPasswordResetToken();
  await User.save({ validateBeforeSave: false });
  //send it to the user email
  const resetURL = ``
};
exports.resetPassword = (req, res, next) => {};
