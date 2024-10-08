import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ToastAndroid, Dimensions } from "react-native";
import { Button, Card, Title } from "react-native-paper";
import * as LocalAuthentication from "expo-local-authentication";

const { height } = Dimensions.get("window");

export default function Attendence({ navigation }) {
	const [loading, setLoading] = useState(false);

	function showToast(msg) {
		ToastAndroid.show(msg, ToastAndroid.SHORT);
	}

	useEffect(() => {
		(async () => {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			if (!compatible) {
				showToast("Biometric authentication is not supported on this device");
			}
		})();
	}, []);

	const handleBiometricAuth = async () => {
		setLoading(true);
		const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
		if (!isBiometricAvailable) {
			showToast("Biometric authentication is not supported on this device");
			setLoading(false);
			return;
		}

		const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
		if (!savedBiometrics) {
			showToast("Please Set Up Biometric on This Device or use Password");
			setLoading(false);
			return;
		}

		const biometricAuth = await LocalAuthentication.authenticateAsync({
			promptMessage: "Login with Biometrics",
			cancelLabel: "Cancel",
			fallbackLabel: "Use Passcode",
		});

		if (biometricAuth.success) {
			navigation.navigate("locateuser", {
				isVerified: true,
				name: "Keshav",
				rollno: "22BD1A054N",
			});
		} else {
			showToast("Could not authenticate. Please try again.");
		}
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Attendance App</Text>
			</View>
			<Card style={styles.card}>
				<Card.Content>
					<Title style={styles.title}>Welcome Back!</Title>
					<Text style={styles.description}>Please authenticate to continue.</Text>
					<Button
						loading={loading}
						mode="contained"
						onPress={handleBiometricAuth}
						style={styles.button}
						color="#4CAF50" 
					>
						Authenticate
					</Button>
				</Card.Content>
			</Card>
			<View style={styles.footer}>
				<Text style={styles.footerText}>© 2024 Attendance App. All Rights Reserved.</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: "#ffffff", 
		padding: 20,
	},
	header: {
		position: 'absolute',
		top: 50,
		width: '100%',
		alignItems: 'center',
	},
	headerText: {
		fontSize: 28,
		color: "#000", 
		fontWeight: 'bold',
		textAlign: 'center',
	},
	card: {
		width: '100%',
		maxWidth: 400,
		borderRadius: 20,
		elevation: 10,
		padding: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: "#ffffff", 
	},
	title: {
		textAlign: "center",
		marginBottom: 10,
		color: "#000", 
		fontSize: 24,
		fontWeight: 'bold',
	},
	description: {
		textAlign: "center",
		marginBottom: 20,
		color: "#000", 
		fontSize: 16,
	},
	button: {
		marginTop: 10,
		paddingVertical: 5,
		borderRadius: 5,
		width: '100%', 
	},
	footer: {
		position: 'absolute',
		bottom: 20,
		alignItems: 'center',
	},
	footerText: {
		color: "#000", 
		fontSize: 14,
		textAlign: 'center',
	},
});
