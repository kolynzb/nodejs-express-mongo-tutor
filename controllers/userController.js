const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //first parameter is the error ,second is the file destination
//   },
//   filename: (req, file, cb) => {
//     //user-userid-timestamp.jpeg
//     const ext = file.mimetype.split('/')[1]; //setting the extension of the image
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //first parameter is the error ,second is the file name
//   }
// });
const multerStorage = multer.memoryStorage(); //image stored on a buffer to make calling it easier instead of loading it using fs

//check if file uploaded is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images,', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadUserPhoto = upload.single('photo'); //photo is the name of the feild that your uploading to

//resize user photo to make it a square image using sharp as an image prossessing library
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // add to req object for other middleware
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

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

  if (req.file) filteredBody.photo = req.file.filename; //check if file was uploaded and add it to the filter document
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
  getUserById,
  uploadUserPhoto,
  resizeUserPhoto
};
