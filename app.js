const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

process.env.NODE_ENV = 'development' && app.use(morgan('dev'));

app.use(express.json()); // helps us access to the request body
app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res) => {
  //this  is for undefined routes
  res
    .status(404)
    .json({ status: 'fail', message: `Cant find ${req.originalUrl}` });
});

module.exports = app;
