import React, { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import Home from "./screens/Home";
import Attendence from "./screens/Attendence";
import LocateUser from "./screens/attendence/LocateUser";
import Settings from "./screens/Settings";
import ErrorPage from "./screens/attendence/ErrorPage";
import SuccessPage from "./screens/attendence/SuccessPage";
import Login from "./screens/Login";
import { StatusBar, Touchable, View } from "react-native";
import Profile from "./screens/Profile";
import { AuthProvider, useAuth } from "./util/AuthContext";
import { clearAllData } from "./util/session";
import axios from "axios";


const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const AttendenceStack = createNativeStackNavigator();

function MarkAttendenceStackScreen() {
	return (
		<AttendenceStack.Navigator initialRouteName="attendence">
			<AttendenceStack.Screen
				name="attendence"
				component={Attendence}
				options={{ headerTitle: "Mark Attendence" }}
			/>
			<AttendenceStack.Screen
				name="locateuser"
				component={LocateUser}
				options={{ headerShown: false }}
			/>
			<AttendenceStack.Screen
				name="error"
				component={ErrorPage}
				options={{ headerShown: false }}
			/>
			<AttendenceStack.Screen
				name="success"
				component={SuccessPage}
				options={{ headerShown: false }}
			/>
		</AttendenceStack.Navigator>
	);
}

function HomeScreenDrawer() {

	return (
		<Drawer.Navigator
			screenOptions={{
				headerTitleStyle: {
					color: "#003366",
				},
				headerTintColor: "#003366",
				drawerLabelStyle: {
					fontSize: 18,
					color: "#003366",
				},
				drawerItemStyle: {
					marginVertical: 0,
					paddingLeft: 10,
					marginTop: 20,
				},
				drawerActiveTintColor: "#0056b3",
				drawerInactiveTintColor: "#666666",
				drawerActiveBackgroundColor: "#cce6ff",
			}}
		>
			<Drawer.Screen
				name="Home"
				component={Home}
				options={{
					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="home" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Profile"
				component={Profile}
				options={{
					drawerIcon: ({ color, size }) => (
						<AntDesign name="user" size={size} color={color} />
					),
				}}
			/>
			<Drawer.Screen
				name="Settings"
				component={Settings}
				options={{
					drawerIcon: ({ color, size }) => (
						<AntDesign name="setting" size={size} color={color} />
					),
				}}
			/>

		</Drawer.Navigator>
	);
}

function MainNavigator() {
	const { user } = useAuth();


	const checkJWT = async () => {
		try {
			const response = await axios.get("http://192.168.1.4:8000/api/user/check", {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
		} catch (error) {
			if (error.response && error.response.status === 401) {
				console.log("Token expired, logging out...");
				clearAllData();
				window.location.reload();
			} else {
				console.log("Error checking JWT : ", error);
			}
		}
	};



	useEffect(() => {
		if (user?.token) {
			const interval = setInterval(() => {
				checkJWT();
				console.log("Check : ", user?.token);
			}, 60000);
			// getHolidays();
			return () => clearInterval(interval);
		}
	}, [user]);

	// console.log("first", user?.user)


	return !user ? (
		<Login />
	) : (
		<Tab.Navigator
			initialRouteName="Home4"
			screenOptions={{
				headerShown: false,
				headerStyle: {
					color: "#003366",
				},
				tabBarLabelStyle: {
					color: "#003366",
					fontSize: 16,
				},
				tabBarActiveTintColor: "#0056b3",
				tabBarInactiveTintColor: "#666666",
			}}
		>
			<Tab.Screen
				name="Home4"
				component={HomeScreenDrawer}
				options={{
					tabBarLabel: "Home",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="home" color={color} size={size} />
					),
					tabBarBadge: null,
				}}
			/>
			<Tab.Screen
				name="markme"
				component={MarkAttendenceStackScreen}
				options={{
					tabBarLabel: "Mark Me",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons
							name="checkbox-multiple-marked-circle-outline"
							size={size}
							color={color}
						/>
					),
					tabBarBadge: null,
				}}
			/>
		</Tab.Navigator>
	);
}



export default function App() {

	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<AuthProvider>
			<PaperProvider>
				<StatusBar
					backgroundColor="white"
					color="black"
					barStyle="dark-content"
				/>
				<StatusBar style="light" />
				<NavigationContainer>
					<MainNavigator />
				</NavigationContainer>
			</PaperProvider>
		</AuthProvider>
	);
}
