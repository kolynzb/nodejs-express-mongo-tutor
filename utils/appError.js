class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //for operational errors

    Error.captureStackTrace(this, this.constructor); // this prevents the error from poluting the stack trace  to the stack trace that can be access by using err.stack() in our middleware
  }
}

module.exports = AppError;
