const express = require('express');
const { loginUser, registerUser, getProfile, markAttendance, updatePassword, checkToken, isHoliday, getHolidays, test, getHolidaysThisMonth, getUserAttendanceSummary, getUserAttendanceLastTwoWeeks } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/check", checkToken);

router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/get-profile', protect, getProfile);

router.post('/test', protect, test);

router.post('/update-password', protect, updatePassword);

router.get('/is-holiday', protect, isHoliday);

router.get('/get-this-month-holidays', protect, getHolidaysThisMonth);

router.get('/get-holidays', protect, getHolidays);

router.post('/mark-attendance', protect, markAttendance);

router.get('/get-attendance-summary', protect, getUserAttendanceSummary);

router.get('/get-two-week-attendance', protect, getUserAttendanceLastTwoWeeks);

module.exports = router;