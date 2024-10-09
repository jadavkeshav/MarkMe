const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const profileSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rollNo: {
      type: String,
      unique: true,
    },
    profilePhoto: {
      type: String,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
  }, { timestamps: true });
  
  const Profile = mongoose.model('Profile', profileSchema);
  module.exports = Profile;
  