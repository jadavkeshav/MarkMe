const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const profileModel = require('../models/profileModel');
const attendenceRecordModel = require('../models/attendenceRecordModel');
var cron = require('node-cron');


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
            { expiresIn: '30d' }
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


// const fillMissingAttendance = async (userId, startDate, endDate) => {
//     try {
//         // Fetch the attendance record for the user
//         const attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

//         // If no record exists, return early
//         if (!attendanceRecord) {
//             console.log('No attendance record found for user:', userId);
//             return;
//         }

//         // Create an array of existing dates
//         const existingDates = attendanceRecord.records.map(record => {
//             return new Date(record.date).setHours(0, 0, 0, 0);
//         });

//         // Sort existing dates in ascending order
//         existingDates.sort((a, b) => a - b);

//         // Ensure startDate is the earliest and endDate is the latest
//         const sortedDates = [new Date(startDate), new Date(endDate)].sort((a, b) => a - b);
//         const [finalStartDate, finalEndDate] = sortedDates;

//         let currentDate = finalStartDate;

//         while (currentDate <= finalEndDate) {
//             const currentDateStart = new Date(currentDate).setHours(0, 0, 0, 0);
//             if (!existingDates.includes(currentDateStart)) {
//                 // If the current date is not present, push a new absent record
//                 attendanceRecord.records.push({
//                     date: currentDate,
//                     status: 'absent',
//                 });
//             }
//             currentDate.setDate(currentDate.getDate() + 1);
//         }
//         await attendanceRecord.save();
//         console.log('Updated attendance records for user:', userId);
//     } catch (error) {
//         console.error('Error filling missing attendance:', error);
//     }
// };


// const markAttendance = async (req, res) => {
//     const userId = req.user.id; // Get the user ID from the request
//     let currentTime = new Date(); // Get the current time
//     console.log("Current Time : ", currentTime);

//     const todayStart = new Date().setHours(0, 0, 0, 0); // Start of today
//     try {
//         // Fetch the attendance record for the user
//         let attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

//         // If no record exists, create a new one
//         if (!attendanceRecord) {
//             attendanceRecord = await attendenceRecordModel.create({
//                 user: userId,
//                 records: [{
//                     date: currentTime,
//                     firstCheckInTime: currentTime, // Store first check-in time here
//                     status: 'half-day'
//                 }]
//             });
//             return res.json({ message: 'First check-in recorded as half-day', attendanceRecord });
//         }

//         const todayRecord = attendanceRecord.records.find(record => {
//             // Check if the record's date is today
//             const recordDate = new Date(record.date).setHours(0, 0, 0, 0);
//             return recordDate === todayStart;
//         });

//         console.log("Today record : ", todayRecord);

//         // If there's no attendance record for today, push a new record
//         if (!todayRecord) {
//             attendanceRecord.records.push({
//                 date: currentTime,
//                 firstCheckInTime: currentTime, // Store the first check-in time for new records
//                 status: 'half-day'
//             });
//             await attendanceRecord.save();
//             return res.json({ message: 'First check-in recorded as half-day', attendanceRecord });
//         }

//         // Check status and calculate time differences
//         if (todayRecord.status === 'half-day') {
//             const firstCheckInTime = new Date(todayRecord.date); // Use date from todayRecord for comparison
//             console.log("First Check-In Time: ", firstCheckInTime);

//             // Calculate hours since the first check-in
//             const hoursSinceFirstCheckIn = (currentTime - firstCheckInTime) / (1000 * 60 * 60);
//             console.log(`Hours since first check-in: ${hoursSinceFirstCheckIn}`);

//             // Update attendance status based on time since first check-in
//             if (hoursSinceFirstCheckIn >= 2 && hoursSinceFirstCheckIn <= 9) {
//                 todayRecord.status = 'present'; // Mark as present
//                 await attendanceRecord.save(); // Save the updated attendance record
//                 return res.json({ message: 'Second check-in recorded, marked as present', attendanceRecord });
//             } else if (hoursSinceFirstCheckIn > 9) {
//                 return res.status(400).json({
//                     message: 'Too much time has passed since the first check-in. Status remains as half-day'
//                 });
//             } else {
//                 return res.status(400).json({
//                     message: 'Check-in too soon, please try again later'
//                 });
//             }
//         } else {
//             return res.status(400).json({ message: 'Attendance already marked as present for today' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error marking attendance' });
//     }
// };

function getYesterdaysDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

function getTimeDifferenceFromNineAM() {
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0);
    const now = new Date();
    if (now.getDate() === nineAM.getDate() &&
        now.getMonth() === nineAM.getMonth() &&
        now.getFullYear() === nineAM.getFullYear()) {
        let difference = now - nineAM;
        // console.log("DIfference : ", difference)
        if (difference < 0) {
            return {
                success: false,
                hours: 0,
                minutes: 0,
                seconds: 0,
                date: NaN
            };
        }
        const hours = Math.floor(difference / (1000 * 60 * 60));
        difference %= (1000 * 60 * 60);
        const minutes = Math.floor(difference / (1000 * 60));
        difference %= (1000 * 60);
        const seconds = Math.floor(difference / 1000);
        return {
            success: true,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            date: now.toDateString()
        };
    } else {
        return {
            success: false,
            hours: 0,
            minutes: 0,
            seconds: 0,
            date: NaN
        };
    }
}

function getTimeDifferenceFromObject(timeObject) {
    const { hours, minutes, seconds, date } = timeObject;
    // console.log("TimeObject : ", timeObject)
    const targetDate = new Date(date);
    const now = new Date();
    if (targetDate.getDate() === now.getDate() &&
        targetDate.getMonth() === now.getMonth() &&
        targetDate.getFullYear() === now.getFullYear()) {
        const targetTime = new Date();
        targetTime.setHours(hours, minutes, seconds, 0);
        let difference = now - targetTime;
        if (difference < 0) {
            return {
                success: false,
                hours: 0,
                minutes: 0,
                seconds: 0,
                date: now
            };
        }
        const diffHours = Math.floor(difference / (1000 * 60 * 60));
        difference %= (1000 * 60 * 60);
        const diffMinutes = Math.floor(difference / (1000 * 60));
        difference %= (1000 * 60);
        const diffSeconds = Math.floor(difference / 1000);
        return {
            hours: diffHours,
            minutes: diffMinutes,
            seconds: diffSeconds
        };
    } else {
        return "The passed date is not today's date.";
    }
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

const markAttendance = async (req, res) => {
    const userId = req.user.id;
    const username = req.user.username;
    try {
        const diff9 = getTimeDifferenceFromNineAM();
        // console.log("Diff9 : ", diff9.success);
        if (!diff9.success) {
            console.log(`${username} => Too Early.Can't Mark attendence now.`);
            return res.status(401).json({ message: "Too Early.Can't Mark attendence now." });
        }
        const userRecords = await attendenceRecordModel.findOne({
            user: userId,
        });

        if (!userRecords) {
            if (!diff9.success) {
                console.log(`${username} => Can't Mark attendence now.`);
                return res.status(401).json({ message: "Can't Mark attendence now." });
            }
            if ((diff9.hours > 0) && (diff9.hours < 20)) {
                const newUserRecod = await attendenceRecordModel.create({
                    user: userId,
                    records: {
                        date: diff9.date,
                        status: 'half-day'
                    }
                })
                console.log(`${username} => Attendence marked as half-day`);
                return res.json({ message: 'Attendence marked as half-day', newUserRecod });
            } else {
                console.log(`${username} => Can't Mark attendence now.`);
                return res.status(401).json({ message: "Can't Mark attendence now." });
            }
        }

        let todayUserRecord = userRecords.records.filter((record) => {
            const recordDate = new Date(record.date).toDateString();
            return recordDate == diff9.date
        });
        if (!todayUserRecord) {
            let nowAtt = {
                date: diff9.date,
                status: 'half-day'
            }
            userRecords.records.push(nowAtt);
            await userRecords.save();
            console.log(`${username} => New record created and attendence marked as half-day.`);
            return res.json({ message: 'Attendence marked as half-day', attendanceRecord });
        }
        // console.log("DATE ---- > : ", todayUserRecord[0].date)
        const firstCheckIn = convertDateToObject(todayUserRecord[0].date);
        console.log(`${username} => First-check-In`);
        // console.log("First check-in : ", firstCheckIn);
        const secondCheckIn = getTimeDifferenceFromObject(firstCheckIn);
        console.log(`${username} => Second-Check-In.`);
        // console.log("Second check-in : ", secondCheckIn);

        if (((secondCheckIn.hours >= 5) && (secondCheckIn.minutes >= 55)) && secondCheckIn.hours <= 8) {
            let nowAtt = {
                date: diff9.date,
                status: 'present'
            }
            userRecords.records.push(nowAtt);
            await userRecords.save();
            console.log(`${username} => Attendence marked as Present.`);
            return res.json({ message: 'Attendence marked as Present', attendanceRecord });
        } else if (secondCheckIn.hours >= 2 && ((secondCheckIn.hours < 5) && (secondCheckIn.minutes < 55))) {
            let nowAtt = {
                date: diff9.date,
                status: 'half-day'
            }
            userRecords.records.push(nowAtt);
            await userRecords.save();
            console.log(`${username} => Attendence marked as half-day.`);
            return res.json({ message: 'Attendence marked as half-day', attendanceRecord });
        } else if ((secondCheckIn.hours >= 9) && (secondCheckIn.minutes >= 1)) {
            console.log(`${username} => Too much time has passed since the first check-in. Status remains as half-day.`);
            return res.status(400).json({
                message: 'Too much time has passed since the first check-in. Status remains as half-day'
            });
        } else {
            console.log(`${username} => Check-in too soon, please try again later.`);
            return res.status(400).json({
                message: 'Check-in too soon, please try again later'
            });
        }
    } catch (error) {
        console.error(error);
        console.log(`${username} => Error marking attendance.`);
        res.status(500).json({ message: 'Error marking attendance' });
    }
}



module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updatePassword,
    markAttendance,
    checkToken
}