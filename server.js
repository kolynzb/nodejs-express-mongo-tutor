const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

//handling uncaught exceptions
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection 💥 shutting down....');

  process.exit(1);
});

const port = process.env.PORT || 3000;

const DB_URI = process.env.DATABASE_LOCAL;

mongoose.connect(DB_URI).then(() => console.log('Db connected successfully'));

const server = app.listen(port, () => console.log(`listening on port ${port}`));

//for unhandled promise rejections rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection 💥 shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
