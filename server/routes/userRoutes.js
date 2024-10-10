const express = require('express');
const { loginUser, registerUser, getProfile, markAttendance, updatePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/get-profile', protect, getProfile);

router.post('/update-password', protect, updatePassword);

router.post('/mark-attendance', protect, markAttendance);

module.exports = router;