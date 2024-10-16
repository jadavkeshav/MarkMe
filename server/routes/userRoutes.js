const express = require('express');
const { loginUser, registerUser, getProfile, markAttendance, updatePassword, checkToken } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/check", checkToken);

router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/get-profile', protect, getProfile);

router.post('/update-password', protect, updatePassword);

router.post('/mark-attendance', protect, markAttendance);

module.exports = router;