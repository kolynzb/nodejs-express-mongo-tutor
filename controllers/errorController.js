module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //default status code for an error
  err.status = err.status || 'error'; //default status

  res.status(err.statusCode).json({ status: err.status, message: err.message });
};
