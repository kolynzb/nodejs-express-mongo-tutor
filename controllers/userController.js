const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFeilds) => {
  const newObj = {};
  Object.keys(obj) //returns an arrays of the object key names
    .forEach(el => {
      if (allowedFeilds.includes(el)) newObj[el] = obj[el];
    });
  return newObj;
};

const getAllUsers = factory.getAll(User);
const getUserById = factory.getOne(User);
const updateUser = factory.updateOne(User);

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

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

const deleteUser = factory.deleteOne(User);

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
  updateUser,
  getMe,
  deleteUser,
  getUserById
};
