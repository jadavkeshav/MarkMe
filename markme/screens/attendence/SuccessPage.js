import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SuccessPage({ route, navigation }) {
    const { message } = route.params; // Retrieve the message from route params

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('attendence'); // Optional: Navigate back after a period
        }, 5000); // Show message for 5 seconds (optional)

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.successText}>{message}</Text>
            <Button title="Go Back" onPress={() => navigation.navigate('attendence')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'green',
        textAlign: 'center',
        marginBottom: 20,
    },
});
