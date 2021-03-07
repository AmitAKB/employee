var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/employees', {
  useMongoClient: true
});

module.exports = mongoose;