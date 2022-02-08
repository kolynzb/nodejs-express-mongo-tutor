const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name '] },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password ']
  }
});

module.exports = mongoose.model('User', userSchema);
