const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true //cannot be modified by the browser and send it automatically with every request
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //only sent over encrypted  if in production

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `$req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  //SECRET STRING MUST BE ATLEAST 36 CHARACTERS LONG also expiration time can be 90d 10h 5m 3s
  createSendToken(newUser, 201, res);
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

exports.logout = (req, res) => {
  //create a fake token that expires in a few seconds
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //get token and check if its there,
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  req.locals.user = currentUser;
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

    next();
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
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH  request with your new password and passwordConfirm to ${resetURL}. \n If you didnt forget your password ignore this email.`;

  try {
    // await sendEmail({
    //   email: user.email || req.body.email,
    //   subject: 'Your password reset token (Valid for 10min)',
    //   message
    // });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There is an error sending the email try again later', 500)
    );
  }

  res
    .status(200)
    .json({ status: 'success', message: 'Token has been sent to your mail' });
};
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() }
  });
  //if the token has not expired and there is user , ser the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //we use save because we want to run all the validator that dont run with update
  //log user in and send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user from collection
  // const user = await User.find({ _id: req.user.id });

  const user = await User.findById(req.user.id).select('+password');
  //check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Currrent password is Wrong password', 403));
  //update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //User
  await user.save();
  //log user in send jwt
  createSendToken(user, 200, res);
});

//Only for rendered pages and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //check if user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      //check if user has recently changed there password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      //THERE IS A LOGGED IN USER
      req.locals.user = currentUser; //this will give access to the user in pug
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
