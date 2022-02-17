const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//factory functions are functions that return functions
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(
        new AppError(`No Document found with id ${req.params.id}`, 404)
      );

    res.status(204).json({
      status: 'success',
      message: 'Document was successfully deleted',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc)
      return next(
        new AppError(`No document found with id ${req.params.id}`, 404)
      );

    res.status(200).json({
      status: 'success',
      data: { data: doc }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { data: doc } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc)
      return next(
        new AppError(`No document found with id ${req.params.id}`, 404)
      );

    res.status(200).json({
      status: 'success',
      data: { doc }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res) => {
    //for nested get revieews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs }
    });
  });
