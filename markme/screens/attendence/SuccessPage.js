import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";

const SuccessPage = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <MaterialCommunityIcons name="check-circle" size={100} color="green" />
            </View>
            <Text style={styles.successMessage}>Attendance marked successfully!</Text>
            <Button
                mode="contained"
                style={styles.button}
                onPress={() => navigation.navigate('Home')} 
            >
                Go Back
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 16,
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(0, 255, 0, 0.2)", 
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    successMessage: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
});

export default SuccessPage;
