import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { ProgressBar, Card, Title, Subheading } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';

const Profile = () => {
    const attendancePercentage = 100; 
    const userInfo = {
        name: "John Doe",
        rollNo: "22BD1A054N",
        class: "10th Grade",
        email: "johndoe@example.com",
    };

    return (
        <View style={styles.container}>
            <Image 
                source={{ uri: "https://via.placeholder.com/150" }} 
                style={styles.profilePhoto}
            />
            <Title style={styles.userName}>{userInfo.name}</Title>
            <Subheading style={styles.userRollNo}>{userInfo.rollNo}</Subheading>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Attendance Percentage</Title>
                    <View style={styles.speedometerContainer}>
                        <Svg height="100" width="100">
                            <G rotation="-90" origin="50,50">
                                <Circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                                <Circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    stroke="#76c7c0" 
                                    strokeWidth="10" 
                                    fill="none" 
                                    strokeDasharray={`${attendancePercentage * 2.83}, 100`} 
                                />
                            </G>
                        </Svg>
                        <Text style={styles.attendanceText}>{attendancePercentage}%</Text>
                    </View>
                </Card.Content>
            </Card>
            
            <Card style={styles.infoCard}>
                <Card.Content>
                    <Title>User Information</Title>
                    <Text style={styles.infoText}>Class: {userInfo.class}</Text>
                    <Text style={styles.infoText}>Email: {userInfo.email}</Text>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    profilePhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userRollNo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        marginBottom: 20,
        padding: 10,
    },
    speedometerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    attendanceText: {
        position: 'absolute',
        top: '35%',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoCard: {
        width: '100%',
        padding: 10,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default Profile;
