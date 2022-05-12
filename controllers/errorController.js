const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  //hanlding invalid db ids
  return new AppError(`Invalid ${err.path} : ${err.value}`, 400);
};
const handleDuplicateErrorDB = err => {
  //we use regex to find the value in quotes
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  //hanlding invalid db ids
  return new AppError(`duplicate feild value: ${value}`, 400); //400 bad request
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(val => val.message);
  //handling invalid input data
  return new AppError(`invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token please login again', 400);

const handleJWTExpiredError = () =>
  new AppError('Token has expired please login again', 400);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      errors: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    //rendered website
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong!', msg: err.message });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res
        .status(err.status)
        .render('error', { title: 'Something went wrong!', msg: err.message });

    //programming errors dont leak details
    console.error('ERROR 💥', err);

    return res
      .status(500)
      .json({ status: ' error', message: 'Please try again later' });
  }

  //for rendered website
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  //programming errors should not leak details to client

  return res
    .status(500)
    .json({ status: ' error', message: 'Sommething went wrong' });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //default status code for an error
  err.status = err.status || 'error'; //default status

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
