const mongoose = require('mongoose');

const centerCorrSchema = new mongoose.Schema({
    minAttendancePercentage: {
        type: Number,
        required: true,
        default: 75,
    },
    graceDays: {
        type: Number,
        default: 0,
    },
    maxLateDays: {
        type: Number,
        default: 5,
    },
    location: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    radius: {
        type: Number,
        default: 100,
    },

}, { timestamps: true });

module.exports = mongoose.model('CenterCorr', centerCorrSchema);
