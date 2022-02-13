const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//Global middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
  max: 100, //num of request
  windowMs: 60 * 60 * 1000, //time window
  message: 'Too many request from this Ip ,please try again in an hour!'
});

app.use('/api', limiter);
app.use(express.json()); // helps us access to the request body
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // this  is for undefined routes
  // res
  //   .status(404)
  //   .json({ status: 'fail', message: `Cant find ${req.originalUrl}` });

  // const err = new Error(`Cant find ${req.originalUrl}`); //error message
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl}`, 404)); //when we pass in a parameter it will assume that this is an error ad trigger the error handling middleware
});
app.use(globalErrorHandler);
module.exports = app;
