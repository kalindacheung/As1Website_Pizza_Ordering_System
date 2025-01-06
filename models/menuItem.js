// models/menuItem.js
const mongoose = require('mongoose');

// Define the schema for MenuItem
const menuItemSchema = new mongoose.Schema({
  name: String,
  detail: String,
  cals: String,
  price: Number,
  imgURL: String
});

// Create the MenuItem model
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;