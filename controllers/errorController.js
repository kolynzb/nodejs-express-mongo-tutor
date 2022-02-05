const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  //hanlding invalid db ids
  return new AppError(`Invalid ${err.path} : ${err.value}`, 400);
};
const handleDuplicateErrorDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  //hanlding invalid db ids
  return new AppError(`duplicate feild value: ${value}`, 400); //400 bad request
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    errors: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    //programming errors dont leak details
  } else {
    console.error('ERROR 💥', err);

    res
      .status(500)
      .json({ status: ' error', message: 'Sommething went wrong' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //default status code for an error
  err.status = err.status || 'error'; //default status
  //   console.log((process.env.NODE_ENVI = 'development'));
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    sendErrorProd(error, res);
  }
};
