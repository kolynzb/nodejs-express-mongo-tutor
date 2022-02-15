const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//Global middlewares

app.use(helmet()); //for security http headers and must be ontop of the middleware stack

if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); //development logging

const limiter = rateLimit({
  max: 100, //num of request
  windowMs: 60 * 60 * 1000, //time window
  message: 'Too many request from this Ip ,please try again in an hour!'
});

app.use('/api', limiter); //will limit all routes that start with /api

app.use(express.json({ limit: '10kb' })); // helps us access to the request body(body parser) and wont accept a body larger than 10kb

//Data sanitization against nosql query injection
app.use(mongoSanitize()); //returns a middleware that filters all dollar signs and dots to remove mongo db queries

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ] //this is a list of prameters that will be ignored
  })
);

app.use(express.static(`${__dirname}/public`)); //Serving static files

app.use((req, res, next) => {
  //this is test middleware
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
