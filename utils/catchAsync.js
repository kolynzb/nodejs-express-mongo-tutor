module.exports = fn => {
  // the annonymous function that has been returned  will be assigned to create tour
  // fn(req, res, next).catch(err => next(err)); short hand for this
  //since it returns a promise we can use cathc when its rejected
  return (req, res, next) => fn(req, res, next).catch(next);
};
