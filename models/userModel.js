const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: 8,
    select: false //prevents it from showing when requested
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
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
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

//instance method ---is a method that is available on all documents
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //this.password is not available beacuse of the select false
  return await bcrypt.compare(candidatePassword, userPassword);
};

//this instance method checks if the password was changed after the token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    //only if the password has been changed
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 //this is the base -- base 10
    ); //divide by thousand to make it milliseconds and then convert to an integer
    return JWTTimestamp < changedTimestamp;
  }
  //false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex'); //generating a random token string

  //encrpt password
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .diggest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //adding 10 minutes multiple by 60 to make it secs and 1000 to make it milli seconds
  return resetToken;
};
module.exports = mongoose.model('User', userSchema);
