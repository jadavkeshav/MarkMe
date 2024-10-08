import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';

export default function Settings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = () => {
        if (newPassword === confirmPassword) {
            Alert.alert("Success", "Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            Alert.alert("Error", "New password and confirmation do not match.");
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Update Password</Title>
            <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={text => setCurrentPassword(text)}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={text => setNewPassword(text)}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={text => setConfirmPassword(text)}
                secureTextEntry
                style={styles.input}
            />
            <Button mode="contained" onPress={handleUpdatePassword} style={styles.button}>
                Update Password
            </Button>
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
    title: {
        marginBottom: 20,
        color: "#333", 
    },
    input: {
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#fff', 
        borderRadius: 5,
    },
    button: {
        marginTop: 10,
        width: '100%', 
    },
});
