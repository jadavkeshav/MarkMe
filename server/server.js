const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const cors = require("cors");
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const attendenceRecordModel = require('./models/attendenceRecordModel.js');
const User = require('./models/userModel.js');

cron.schedule('0 20 * * *', () => {
    console.log('Running a task every day at 8 PM');
});
cron.schedule('* * * * *', () => {
    console.log('Running a task every minute');
});

cron.schedule('0 * * * *', () => {
    console.log('Running a task at the start of every hour');
});

const holidayFilePath = path.join(__dirname, '../Holidays.json');

// Schedule a cron job to run at 11:59 PM every day
// cron.schedule('59 23 * * *', async () => {
    
// });

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

connectDB();

app.get('/test', (req, res) => {
    res.json({ message: `Server running on port ${PORT} on Process ${process.pid}` })
})

app.use('/api/user', require("./routes/userRoutes.js"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} on Process ${process.pid}`));

