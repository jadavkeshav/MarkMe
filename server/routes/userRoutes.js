const express = require('express');
const { loginUser, registerUser, getProfile, markAttendance, updatePassword, checkToken, isHoliday, getHolidays, test, getHolidaysThisMonth, getUserAttendanceSummary, getUserAttendanceLastTwoWeeks } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your limitation—it’s only your imagination.", author: "Anonymous" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" }
];

// Route to get a random quote
router.get('/quote', (req, res) => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    res.json(randomQuote);
});

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