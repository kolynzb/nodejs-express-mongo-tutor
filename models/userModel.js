const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  passwordConfirm: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);
