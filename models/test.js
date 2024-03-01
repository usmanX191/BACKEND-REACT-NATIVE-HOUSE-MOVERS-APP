const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mySchema = new Schema({
  name: String,
  age: Number
});

const MyModel = mongoose.model('MyModel', mySchema);