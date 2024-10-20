const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const attendanceRecordSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    records: [{
        date: {
          type: Date,
          required: true,
          default: Date.now()
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'half-day'],
        },
        location: {
          latitude: {
            type: Number,
          },
          longitude: {
            type: Number,
          },
        },
        firstCheckIn: {
          type: Date,
          default: Date.now()
        },
        secondCheckIn: {
          type: Date,
        },
      }],
  }, { timestamps: true });
  
  module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
