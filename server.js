const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 3000;

const DB_URI = process.env.DATABASE_LOCAL;

mongoose.connect(DB_URI).then(() => console.log('Db connected successfully'));

app.listen(port, () => console.log(`listening on port ${port}`));
