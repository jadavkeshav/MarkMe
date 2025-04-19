const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const profileModel = require('../models/profileModel');
const attendenceRecordModel = require('../models/attendenceRecordModel');
var cron = require('node-cron');
const fs = require("fs");
const path = require("path");
const { now } = require('mongoose');


const generateToken = (username, userId, role) => {
    return jwt.sign({ username, userId, role }, process.env.JWT_SECRET, { expiresIn: '9hr' });
};

const checkToken = (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        console.log("No token provided")
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.log("Token has expired")
                return res.status(401).json({ message: "Token has expired" });
            }
            console.log("Invalid token")
            return res.status(401).json({ message: "Invalid token" });
        }
        console.log("Token is valid");
        return res.status(200).json({ message: "Token is valid", user: decoded });
    });
};

const registerUser = asyncHandler(async (req, res) => {
    let { username, password, role, rollNo, name, profilePhoto } = req.body;

    const userExists = await User.findOne({ username, role });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({
            username,
            password: hashedPassword,
            role,
        });

        if (user) {
            if (name && rollNo) {
                try {
                    const profile = await profileModel.create({
                        user: user._id,
                        name,
                        rollNo,
                        profilePhoto,
                    });
                    const attendence = await attendenceRecordModel.create({
                        user: user._id
                    })
                    return res.status(201).json({
                        _id: user._id,
                        name: profile.name,
                        username: user.username,
                        rollNo: profile.rollNo,
                        role: user.role,
                        token: generateToken(user.username, user._id, user.role),
                    });
                } catch (profileError) {
                    console.error('Profile creation error:', profileError);
                    return res.status(500).json({ message: 'Error creating profile' });
                }
            } else {
                return res.status(201).json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user.username, user._id, user.role),
                });
            }
        }
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { username: user.username, userId: user._id, role: user.role }, // Use user._id here
            process.env.JWT_SECRET,
            { expiresIn: '9hr' }
        );

        const profile = await profileModel.findOne({ rollNo: username });
        if (!profile) {
            return res.status(404).json({ message: 'Profile Not Found' });
        }
        const record = await attendenceRecordModel.findOne({ user: user._id })
        const userProfile = {
            name: profile.name,
            username: profile.username,
            rollNo: profile.rollNo,
            profilePhoto: profile.profilePhoto,
            role: user.role,
            attendancePercentage: profile.attendancePercentage,
            attendenceRecord: record.records
        }


        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                ...userProfile
            }
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    let userId = req.user.userId;
    let username = req.user.username;
    try {
        console.log("ID : ", req.user.userId)
        console.log("username : ", username)
        const user = await User.findOne({ _id: userId, username });
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }
        const profile = await profileModel.findOne({ rollNo: username });
        if (!profile) {
            return res.status(404).json({ message: 'Profile Not Found' });
        }
        const record = await attendenceRecordModel.findOne({ user: userId })
        const userProfile = {
            name: profile.name,
            username: profile.username,
            rollNo: profile.rollNo,
            profilePhoto: profile.profilePhoto,
            role: user.role,
            attendancePercentage: profile.attendancePercentage,
            attendenceRecord: record.records
        }
        res.json({
            message: "User Profile Found",
            profile: userProfile
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

const getHolidaysThisMonth = (req, res) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const holidayFilePath = path.join(__dirname, '../Holidays.json');

    fs.readFile(holidayFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Holidays.json:', err);
            return res.status(500).json({ success: false, message: "Unable to fetch holidays" });
        }

        try {
            const holidays = JSON.parse(data);

            const holidaysThisMonth = holidays.filter(holiday => {
                const holidayDate = new Date(holiday.date);
                return holidayDate.getMonth() === currentMonth && holidayDate.getFullYear() === currentYear;
            });

            const numberOfHolidays = holidaysThisMonth.length;
            console.log("number of hold : ", numberOfHolidays)
            return res.status(200).json({
                success: true,
                message: `${numberOfHolidays} holidays found in the current month`,
                numberOfHolidays: numberOfHolidays,
                holidays: holidaysThisMonth
            });
        } catch (parseError) {
            console.error('Error parsing Holidays.json:', parseError);
            return res.status(500).json({ success: false, message: "Error parsing holiday data" });
        }
    });
};

const updatePassword = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    console.log("User Id for password chnage : ", userId)
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
});


function getYesterdaysDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}


const isHoliday = (req, res) => {
    const today = new Date().toDateString();
    const holidayFilePath = path.join(__dirname, '../Holidays.json');
    fs.readFile(holidayFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Holidays.json:', err);
            return;
        }
        const holidays = JSON.parse(data);
        const isTodayHoliday = holidays.some(holiday => holiday.date === today);
        if (isTodayHoliday) {
            console.log(`${today} is a holiday!`);
            return res.status(203).json({ success: true, message: `${today} is a holiday!` })
        } else {
            console.log(`${today} is not a holiday.`);
            return res.status(203).json({ success: false, message: `${today} is not a holiday!` })
        }
    });
}

const getHolidays = (req, res) => {
    const holidayFilePath = path.join(__dirname, '../Holidays.json');
    fs.readFile(holidayFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Holidays.json:', err);
            return res.status(500).json({ success: false, message: "Can't get data" });
        }
        const holidays = JSON.parse(data);
        const formattedHolidays = {};
        holidays.forEach(holiday => {
            const date = new Date(holiday.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            formattedHolidays[formattedDate] = { name: holiday.name };
        });
        console.log(formattedHolidays);
        return res.status(201).json({ success: true, message: "Holiday dates fetched", holidays: formattedHolidays })
    });
}


function convertDateToObject(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (!(date instanceof Date) || isNaN(date)) {
        return "Invalid date input.";
    }
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        date: date.toDateString()
    };
}

const test = () => {
    const now = new Date()
    console.log(now.toLocaleString())
    const f1 = convertDateToObject("2024-10-20T09:08:00.000Z");
    console.log("F1 : ", f1);
    const diffffff = getTimeDifferenceFromObject(f1);
    console.log("diffff : ", diffffff)
}

const markAbsent = async (req, res) => {
    const today = new Date();
    const todayDateString = today.toDateString();
    const isSunday = today.getDay() === 0;
    const holidayFilePath = path.join(__dirname, '../Holidays.json');
    try {
        const holidayData = fs.readFileSync(holidayFilePath, 'utf8');
        const holidays = JSON.parse(holidayData);
        const isHoliday = holidays.some(holiday => new Date(holiday.date).toDateString() === todayDateString);

        if (isHoliday || isSunday) {
            console.log("Today is a holiday or Sunday. Skipping absentee marking.");
            return;
        }

        const users = await User.find();

        users.forEach(async (user) => {
            let attendanceRecord = await attendenceRecordModel.findOne({ user: user._id });

            if (!attendanceRecord || !attendanceRecord.records.find(record => record.date.toLocaleDateString() === today.toLocaleDateString())) {
                if (!attendanceRecord) {
                    attendanceRecord = new attendenceRecordModel({ user: user._id, records: [] });
                }

                attendanceRecord.records.push({
                    date: new Date(),
                    status: 'absent',
                });

                await attendanceRecord.save();
                console.log(`User ${user.username} marked as absent.`);
            }
        });

        res.status(200).json({ message: 'Absent users have been marked successfully.' })

        console.log('Absent users have been marked successfully.');
    } catch (error) {
        res.status(200).json({ message: 'Error marking absentees.' })
        console.error('Error marking absentees:', error);
    }
}

const markAttendance = async (req, res) => {
    const userId = req.user.id;
    const username = req.user.username;
    const today = new Date().toLocaleDateString();
    const currentTime = new Date();

    const holidayFilePath = path.join(__dirname, '../Holidays.json');
    try {

        const holidayData = fs.readFileSync(holidayFilePath, 'utf8');
        const holidays = JSON.parse(holidayData);
        const isHoliday = holidays.some(holiday => new Date(holiday.date).toDateString() === currentTime.toDateString());

        const isSunday = currentTime.getDay() === 0;

        if (isHoliday || isSunday) {
            return res.status(400).json({ success: false, message: "Cannot mark attendance on holidays or Sundays" });
        }

        let attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

        if (!attendanceRecord) {
            attendanceRecord = new attendenceRecordModel({ user: userId, records: [] });
        }

        const todayRecord = attendanceRecord.records.find(record => record.date.toLocaleDateString() === today);

        if (!todayRecord) {
            const timeDifferenceFromNineAM = getTimeDifferenceFromNineAM(currentTime);
            console.log(timeDifferenceFromNineAM);
            if (!timeDifferenceFromNineAM) {
                return res.status(400).json({ success: false, message: "First check-in can only occur after 9 AM." });
            } else if (timeDifferenceFromNineAM.hours >= 2) {
                return res.status(400).json({ success: false, message: "First check-in must be within 1 hour 59 minutes from 9 AM" });
            }

            attendanceRecord.records.push({
                date: currentTime,
                status: 'half-day',
                firstCheckIn: currentTime,
                location: req.body.location,
            });

            await attendanceRecord.save();
            return res.status(201).json({ success: true, message: "First check-in recorded, status marked as half-day" });
        } else if (todayRecord.firstCheckIn && !todayRecord.secondCheckIn) {

            console.log("Today Record : ", todayRecord);

            const timeDifferenceFromFirstCheckIn = getTimeDifferenceFromObject(todayRecord.firstCheckIn, currentTime);


            console.log("timeDifferenceFromFirstCheckIn : ", timeDifferenceFromFirstCheckIn)

            if (timeDifferenceFromFirstCheckIn.hours < 2) {
                return res.status(400).json({ success: false, message: "Second check-in must be at least 2 hours after the first check-in" });
            } else if (timeDifferenceFromFirstCheckIn.hours >= 2 && timeDifferenceFromFirstCheckIn.hours < 5) {

                todayRecord.status = 'half-day';
                todayRecord.secondCheckIn = currentTime;

                await attendanceRecord.save();
                return res.status(200).json({ success: true, message: "Second check-in recorded, status marked as half-day" });
            } else if (timeDifferenceFromFirstCheckIn.hours >= 5 && timeDifferenceFromFirstCheckIn.hours <= 9) {

                todayRecord.status = 'present';
                todayRecord.secondCheckIn = currentTime;

                await attendanceRecord.save();
                return res.status(200).json({ success: true, message: "Second check-in recorded, status marked as present" });
            } else {
                return res.status(400).json({ success: false, message: "You're too late for the second check-in." });
            }
        } else {
            return res.status(400).json({ success: false, message: "Attendance already marked for today" });
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({ success: false, message: 'Error marking attendance' });
    }
};

function getTimeDifferenceFromNineAM(currentTime) {
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0); // set to 9 AM
    if (currentTime < nineAM) {
        return null; // or some indicator that it’s invalid
    }

    return getTimeDifferenceFromObject(nineAM, currentTime);
}

function getTimeDifferenceFromObject(startTime, endTime) {
    const diff = Math.abs(endTime - startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
}

const getUserAttendanceSummary = async (req, res) => {
    const userId = req.user.userId;

    try {
        const attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: "No attendance record found for this user"
            });
        }

        let presentDays = 0;
        let absentDays = 0;

        attendanceRecord.records.forEach(record => {
            if (record.status === 'present') {
                presentDays++;
            } else if (record.status === 'absent') {
                absentDays++;
            }
        });
        return res.status(200).json({
            success: true,
            message: "User attendance summary fetched successfully",
            data: {
                presentDays: presentDays,
                absentDays: absentDays
            }
        });

    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching attendance summary",
            error: error.message
        });
    }
};

const getUserAttendanceLastTwoWeeks = async (req, res) => {
    const userId = req.user.userId;

    try {
        const today = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);

        const attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: "No attendance record found for this user"
            });
        }

        const lastTwoWeeksRecords = attendanceRecord.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= twoWeeksAgo && recordDate <= today;
        });

        const attendanceData = lastTwoWeeksRecords.map(record => ({
            date: record.date.toDateString(), // Convert date to a readable format
            status: record.status,
        }));

        return res.status(200).json({
            success: true,
            message: "Last two weeks attendance records fetched successfully",
            data: attendanceData
        });

    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching attendance records",
            error: error.message
        });
    }
};



module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updatePassword,
    markAttendance,
    checkToken,
    isHoliday,
    getHolidays,
    test,
    markAbsent,
    getHolidaysThisMonth,
    getUserAttendanceSummary,
    getUserAttendanceLastTwoWeeks

}