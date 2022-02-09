const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    required: [true, 'Please confirm your password '],
    validate: {
      validator: function(el) {
        //parameter gives ue acess to the current element but this only works on save and create.
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  }
});
//since this middleware runs between receiving the info and saving it
userSchema.pre('save', async function(next) {
  //only run if password is modified
  if (!this.isModified('password')) return next();
  //hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; //deleting confirm password
  next();
});
module.exports = mongoose.model('User', userSchema);
