const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const profileModel = require('../models/profileModel');
const attendenceRecordModel = require('../models/attendenceRecordModel');


const generateToken = (username, userId, role) => {
    return jwt.sign({ username, userId, role }, process.env.JWT_SECRET, { expiresIn: '9hr' });
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
        const record = await attendenceRecordModel.findOne({user: user._id})
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
        const record = await attendenceRecordModel.findOne({user: userId})
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

// const markAttendance = asyncHandler(async (req, res) => {
//     const userId = req.user.userId;
//     const currentTime = new Date();
//     const today = new Date().toISOString().split('T')[0];

//     let attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

//     if (!attendanceRecord) {
//         attendanceRecord = await attendenceRecordModel.create({ user: userId });
//     }

//     let todayRecord = attendanceRecord.records.find(record => {
//         return record.date.toISOString().split('T')[0] === today;
//     });

//     if (!todayRecord) {
//         todayRecord = {
//             date: currentTime,
//             checkInTimes: [currentTime],
//             status: 'half-day',
//         };
//         attendanceRecord.records.push(todayRecord);
//     } else {
//         const checkInCount = todayRecord.checkInTimes.length;

//         if (checkInCount === 1) {
//             const firstCheckInTime = new Date(todayRecord.checkInTimes[0]);
//             const hoursSinceFirstCheckIn = (currentTime - firstCheckInTime) / (1000 * 60 * 60);

//             if (hoursSinceFirstCheckIn < 2) {
//                 return res.status(400).json({
//                     message: 'For half-day attendance, you need to wait at least 2 hours before the second check-in.',
//                 });
//             } else if (hoursSinceFirstCheckIn >= 2 && hoursSinceFirstCheckIn < 6) {
//                 todayRecord.checkInTimes.push(currentTime);
//                 todayRecord.status = 'half-day';
//             } else if (hoursSinceFirstCheckIn >= 6 && hoursSinceFirstCheckIn <= 9) {
//                 todayRecord.checkInTimes.push(currentTime);
//                 todayRecord.status = 'present';
//                 todayRecord.checkInTimes = [];
//             } else {
//                 todayRecord.status = 'absent';
//                 todayRecord.checkInTimes = [];
//                 return res.status(400).json({
//                     message: 'Time window for full-day check-in missed. You have been marked absent.',
//                 });
//             }
//         } else {
//             return res.status(400).json({
//                 message: 'You have already marked attendance twice today.',
//             });
//         }
//     }

//     await attendanceRecord.save();

//     res.status(200).json({
//         message: `Attendance marked successfully as ${todayRecord.status}.`,
//         attendanceRecord,
//     });
// });

const updatePassword = asyncHandler(async (req, res) => {
    const { userId } = req.user; // Get userId from the request, assumed to be added via middleware
    console.log("User Id for password chnage : ", userId)
    const { oldPassword, newPassword } = req.body; 
    // Get old and new passwords from request body

    
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


const fillMissingAttendance = async (userId, startDate, endDate) => {
    try {
        // Fetch the attendance record for the user
        const attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

        // If no record exists, return early
        if (!attendanceRecord) {
            console.log('No attendance record found for user:', userId);
            return;
        }

        // Create an array of existing dates
        const existingDates = attendanceRecord.records.map(record => {
            return new Date(record.date).setHours(0, 0, 0, 0);
        });

        // Sort existing dates in ascending order
        existingDates.sort((a, b) => a - b);

        // Ensure startDate is the earliest and endDate is the latest
        const sortedDates = [new Date(startDate), new Date(endDate)].sort((a, b) => a - b);
        const [finalStartDate, finalEndDate] = sortedDates;

        let currentDate = finalStartDate;

        while (currentDate <= finalEndDate) {
            const currentDateStart = new Date(currentDate).setHours(0, 0, 0, 0);
            if (!existingDates.includes(currentDateStart)) {
                // If the current date is not present, push a new absent record
                attendanceRecord.records.push({
                    date: currentDate,
                    status: 'absent',
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        await attendanceRecord.save();
        console.log('Updated attendance records for user:', userId);
    } catch (error) {
        console.error('Error filling missing attendance:', error);
    }
};


const markAttendance = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the request
    let currentTime = new Date("2024-10-10T17:00:00.000Z"); // Get the current time
    console.log("Current Time : ", currentTime);
    
    const todayStart = new Date("2024-10-10T17:00:00.000Z").setHours(0, 0, 0, 0); // Start of today
    try {
        // Fetch the attendance record for the user
        let attendanceRecord = await attendenceRecordModel.findOne({ user: userId });

        // If no record exists, create a new one
        if (!attendanceRecord) {
            attendanceRecord = await attendenceRecordModel.create({
                user: userId,
                records: [{
                    date: currentTime,
                    firstCheckInTime: currentTime, // Store first check-in time here
                    status: 'half-day'
                }]
            });
            return res.json({ message: 'First check-in recorded as half-day', attendanceRecord });
        }

        const todayRecord = attendanceRecord.records.find(record => {
            // Check if the record's date is today
            const recordDate = new Date(record.date).setHours(0, 0, 0, 0);
            return recordDate === todayStart;
        });

        console.log("Today record : ", todayRecord);

        // If there's no attendance record for today, push a new record
        if (!todayRecord) {
            attendanceRecord.records.push({
                date: currentTime,
                firstCheckInTime: currentTime, // Store the first check-in time for new records
                status: 'half-day'
            });
            await attendanceRecord.save();
            return res.json({ message: 'First check-in recorded as half-day', attendanceRecord });
        }

        // Check status and calculate time differences
        if (todayRecord.status === 'half-day') {
            const firstCheckInTime = new Date(todayRecord.date); // Use date from todayRecord for comparison
            console.log("First Check-In Time: ", firstCheckInTime);

            // Calculate hours since the first check-in
            const hoursSinceFirstCheckIn = (currentTime - firstCheckInTime) / (1000 * 60 * 60);
            console.log(`Hours since first check-in: ${hoursSinceFirstCheckIn}`);

            // Update attendance status based on time since first check-in
            if (hoursSinceFirstCheckIn >= 2 && hoursSinceFirstCheckIn <= 9) {
                todayRecord.status = 'present'; // Mark as present
                await attendanceRecord.save(); // Save the updated attendance record
                return res.json({ message: 'Second check-in recorded, marked as present', attendanceRecord });
            } else if (hoursSinceFirstCheckIn > 9) {
                return res.status(400).json({
                    message: 'Too much time has passed since the first check-in. Status remains as half-day'
                });
            } else {
                return res.status(400).json({
                    message: 'Check-in too soon, please try again later'
                });
            }
        } else {
            return res.status(400).json({ message: 'Attendance already marked as present for today' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
};






// module.exports = { markAttendance };



module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updatePassword,
    markAttendance
}