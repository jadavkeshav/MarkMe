import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Button, Card, Title, Subheading, Badge, Divider } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';
import { useAuth } from '../util/AuthContext';

const Profile = () => {
    const { user: { user }, logout, getUserAttendanceLastTwoWeeks } = useAuth();

    const [attendance, setAttendance] = useState([]);
    const [attendancePercentage, setAttendancePercentage] = useState(0);  // Initialize with 0


    async function getData() {
        const res = await getUserAttendanceLastTwoWeeks();
        const sortedAttendance = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(sortedAttendance);
        console.log("Sorted getUserAttendanceLastTwoWeeks: ", sortedAttendance);


        // attendecePercentage formulas  = ((presentDays + 0.5 x half-days)/TotalDays) * 100
        const totalDays = sortedAttendance.length;
        const presentDays = sortedAttendance.filter(item => item.status === 'present').length;
        const halfDays = sortedAttendance.filter(item => item.status === 'half-day').length;

        const attendanceScore = presentDays + (0.5 * halfDays);
        const percentage = totalDays > 0 ? (attendanceScore / totalDays) * 100 : 0;

        setAttendancePercentage(percentage.toFixed(2));

        console.log("Sorted getUserAttendanceLastTwoWeeks: ", sortedAttendance);
        console.log("Calculated attendance percentage: ", percentage);
    }

    console.log("User : ", user);
    useEffect(() => {
        getData();
    }, [user])
    // let attendancePercentage = user?.attendancePercentage || 0;
    const userInfo = {
        name: user?.name || "John Doe",
        rollNo: user?.rollNo || "22BD******",
        class: user?.class || "N/A",
        email: user?.email || "example@domain.com",
        imageURI: user?.profilePhoto || "https://via.placeholder.com/150",
        attendanceRecord: user?.attendenceRecord.slice(-6).reverse() || []
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderStatusBadge = (status) => {
        let badgeStyle;
        let label;

        switch (status) {
            case 'present':
                badgeStyle = styles.presentBadge;
                label = 'Present';
                break;
            case 'half-day':
                badgeStyle = styles.halfDayBadge;
                label = 'Half Day';
                break;
            case 'absent':
            default:
                badgeStyle = styles.absentBadge;
                label = 'Absent';
                break;
        }

        return (
            <View style={[styles.statusBadge, badgeStyle]}>
                <Text style={styles.badgeText}>{label}</Text>
            </View>
        );
    };

    const getAttendanceColor = (percentage) => {
        if (percentage < 50) {
            return '#F44336';
        } else if (percentage >= 50 && percentage < 75) {
            return '#FFC107';
        } else {
            return '#4CAF50';
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Image
                    source={{ uri: userInfo.imageURI }}
                    style={styles.profilePhoto}
                />
                <Title style={styles.userName}>{userInfo.name}</Title>
                <Subheading style={styles.userRollNo}>{userInfo.rollNo}</Subheading>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Attendance Percentage</Title>
                        <View style={styles.speedometerContainer}>
                            <Svg height="100" width="100">
                                <G rotation="-90" origin="50,50">
                                    <Circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke={getAttendanceColor(attendancePercentage)}
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray={`${attendancePercentage * 2.83}, 283`}
                                    />
                                </G>
                            </Svg>
                            <Text style={styles.attendanceText}>{attendancePercentage}%</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>User Information</Title>
                        <Text style={styles.infoText}>RollNo &nbsp;&nbsp; {userInfo.rollNo}</Text>
                        <Text style={styles.infoText}>Email &nbsp;&nbsp;&nbsp;&nbsp; {userInfo.email}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.attendanceCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Attendance Record</Title>
                        {attendance.map((item, index) => (
                            <View key={index} style={styles.recordContainer}>
                                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                                {renderStatusBadge(item.status)}
                                <Divider style={styles.recordDivider} />
                            </View>
                        ))}
                        <Text style={styles.attendanceNote}>
                            * This is a record of the last week only.
                        </Text>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={logout}
                    style={styles.logoutButton}
                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                    Logout
                </Button>
                <Text style={styles.copyright}>© 2024 MarkMe by JadavKeshav. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#f0f0f0',

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f0f0f0',
        marginVertical: 20
    },
    profilePhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#003366',
    },
    userRollNo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    card: {
        alignItems: 'center',
        backgroundColor: '#fff',
        textAlign: "center",
        width: '100%',
        marginBottom: 15,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#003366',
        marginBottom: 10,
        textAlign: "center"
    },
    attendanceNote: {
        marginTop: 10,
        fontSize: 12,
        color: 'red',
        textAlign: 'center',
    },
    speedometerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginVertical: 10,
    },
    attendanceText: {
        position: 'absolute',
        top: '35%',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoCard: {

        backgroundColor: '#fff',
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
    },
    infoText: {
        alignItems: 'center',

        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    attendanceCard: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
    },
    recordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 25,  // Increased from 12 to 15 for more height
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginVertical: 5,
    },
    recordDate: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'left',
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    presentBadge: {
        backgroundColor: '#4CAF50',
    },
    halfDayBadge: {
        backgroundColor: '#FFC107',
    },
    absentBadge: {
        backgroundColor: '#F44336',
    },
    badgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    recordDivider: {
        backgroundColor: '#e0e0e0',
        marginVertical: 5,
    },
    logoutButton: {
        marginTop: 20,
        width: '60%',
        paddingVertical: 5,
        borderRadius: 25,
        backgroundColor: '#f44336',
    },
    copyright: {
        marginTop: 20,
        fontSize: 14,
        color: "#666666",
        textAlign: "center",
    },
});

export default Profile;
