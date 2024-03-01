const mongoose = require('mongoose');

// Define the schema for the 'jacket' collection
const jacketSchema = new mongoose.Schema({
  uname: String,
  review: String,
  rate: Number
});

// Create the 'Jacket' model based on the schema
const Jacket = mongoose.model('Jacket', jacketSchema);

module.exports = Jacket;