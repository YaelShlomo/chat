const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role:{
    type: String,
    enum: ['admin', 'user'], 
    default: 'User'
  },
  password: String
});

module.exports = mongoose.model('User', userSchema);
