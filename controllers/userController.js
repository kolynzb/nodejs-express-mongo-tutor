const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
const deleteUser = (req, res) => {};

module.exports = {
  getAllUsers,

  updateUser,
  createUser,
  deleteUser,
  getUserById
};
