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
    sendErrorProd(err, res);
  }
};
