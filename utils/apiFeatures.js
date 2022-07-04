class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // filtering
    const queryObject = { ...this.queryString };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObject[el]);

    //advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`);
    //let query = Tour.find(JSON.parse(queryStr));
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(''); //bug
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //this called projecting
    } else {
      this.query = this.query.select('-__v'); //excluding __ v
    }
    return this;
  }

  paginate() {
    //pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit); //skip 10 results to get to the next page

    return this;
  }
}

module.exports = APIFeatures;
