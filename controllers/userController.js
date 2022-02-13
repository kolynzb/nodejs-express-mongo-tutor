const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFeilds) => {
  const newObj = {};
  Object.keys(obj) //returns an arrays of the object key names
    .forEach(el => {
      if (allowedFeilds.includes(el)) newObj[el] = obj[el];
    });
  return newObj;
};
const createUser = (req, res) => {};
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});
const getUserById = (req, res) => {};
const updateUser = (req, res) => {};

const updateMe = catchAsync(async (req, res, next) => {
  //create an error if user tries to update the password
  if (req.body.password || req.body.passwordConfirm)
    return new AppError(
      'This route is not for password update please use /updateMyPassword',
      400
    );

  //update document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});


const deleteUser = (req, res) => {};

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
  updateUser,
  createUser,
  deleteUser,
  getUserById
};
