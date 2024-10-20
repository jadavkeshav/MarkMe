const express = require('express');
const { loginUser, registerUser, getProfile, markAttendance, updatePassword, checkToken, isHoliday, getHolidays, test } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/check", checkToken);

router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/get-profile', protect, getProfile);

router.post('/test', protect, test);

router.post('/update-password', protect, updatePassword);

router.get('/is-holiday', protect, isHoliday);

router.get('/get-holidays', protect, getHolidays);

router.post('/mark-attendance', protect, markAttendance);

module.exports = router;