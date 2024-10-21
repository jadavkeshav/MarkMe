const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const cors = require("cors");
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const attendenceRecordModel = require('./models/attendenceRecordModel.js');
const User = require('./models/userModel.js');

const holidayFilePath = path.join(__dirname, '../Holidays.json');

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

connectDB();

app.get('/test', (req, res) => {
    console.log("/test point hitting ")
    res.json({ message: `Server running on port ${PORT} on Process ${process.pid}` })
})

app.use('/api/user', require("./routes/userRoutes.js"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} on Process ${process.pid}`));

