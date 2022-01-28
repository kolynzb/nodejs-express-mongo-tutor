const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkId = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  console.log(`param of ${val}`);
  next();
};
exports.checkBody = (req, res, next) => {
  console.log(`body has been checked`);
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1; // when a string has a number and its multiplied by a number its automatically changed to an integer
  const tour = tours.find((tour) => tour.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); //creates a new object by combining the two objects
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) =>
      res.status(201).json({ status: 'success', data: { tour: newTour } })
  );
};
exports.deleteTour = (req, res) => {
  const id = req.params.id * 1; // when a string has a number and its multiplied by a number its automatically changed to an integer
  const tour = tours.find((tour) => tour.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};
exports.getTourById = (req, res) => {
  const id = req.params.id * 1; // when a string has a number and its multiplied by a number its automatically changed to an integer
  const tour = tours.find((tour) => tour.id === id);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};
