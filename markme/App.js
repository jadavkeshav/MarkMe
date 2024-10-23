import React, { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import * as Updates from 'expo-updates';
import Home from "./screens/Home";
import Attendence from "./screens/Attendence";
import LocateUser from "./screens/attendence/LocateUser";
import Settings from "./screens/Settings";
import ErrorPage from "./screens/attendence/ErrorPage";
import SuccessPage from "./screens/attendence/SuccessPage";
import Login from "./screens/Login";
import { StatusBar, Text, Touchable, View } from "react-native";
import Profile from "./screens/Profile";
import { AuthProvider, useAuth } from "./util/AuthContext";
import { clearAllData } from "./util/session";
import axios from "axios";
import { ActivityIndicator } from "react-native";


const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const AttendenceStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function MarkAttendenceStackScreen() {
	return (
		<AttendenceStack.Navigator initialRouteName="attendence" screenOptions={{
			headerStyle: {
				backgroundColor: "#f0f0f0",
			},
			headerTitleStyle:{
				color: "#003366"
			}
		}}>
			<AttendenceStack.Screen
				name="attendence"
				component={Attendence}
				options={{ headerTitle: "Mark Attendence", headerShown: false}}
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
				headerStyle: {
					backgroundColor: "#f0f0f0",

				},
				drawerLabelStyle: {
					fontSize: 18,
					color: "#003366",
				},
				drawerItemStyle: {
					marginVertical: 0,
					paddingLeft: 10,
					marginTop: 20,
				},
				drawerActiveTintColor: "#003366",
				drawerInactiveTintColor: "#666666",
				drawerActiveBackgroundColor: "#cce6ff",
				drawerStyle: {
					backgroundColor: "#fff",
				},
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

function AuthStackScreen() {
	return (
		<AuthStack.Navigator initialRouteName="Login">
			<AuthStack.Screen
				name="Login"
				component={Login}
				options={{ headerShown: false }}
			/>
		</AuthStack.Navigator>
	); 
}

function MainNavigator() {
	const { user } = useAuth();
	const apiURL = process.env.EXPO_PUBLIC_API_URL
	const navigation = useNavigation();

	const checkJWT = async () => {
		try {
			const response = await axios.get(`${apiURL}/user/check`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
		} catch (error) {
			if (error.response && error.response.status === 401) {
				console.log("Token expired, logging out...");
				clearAllData();
				navigation.navigate("Login");
			} else {
				console.log("Error checking JWT : ", error);
				clearAllData();
				navigation.navigate("Login");
			}
		}
	};



	useEffect(() => {
		if (user?.token) {
			const interval = setInterval(() => {
				checkJWT();
				console.log("Check : ", user?.token);
			}, 60000);
			return () => clearInterval(interval);
		}
		checkJWT();
	}, [user]);



	return !user ? (
		<AuthStackScreen />
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
				tabBarActiveTintColor: "#003366",
				tabBarInactiveTintColor: "#666666",
				tabBarStyle: {
					height: 70,
					paddingBottom: 10,
				},
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

	const [isLoading, setIsLoading] = useState(false);

	const {
		currentlyRunning,
		isUpdateAvailable,
		isUpdatePending,
	  } = Updates.useUpdates();
	
	  useEffect(() => {
		const checkForUpdates = async () => {
		  if (isUpdateAvailable) {
			Alert.alert(
			  'Update Available',
			  'A new update is available. Would you like to download it?',
			  [
				{
				  text: 'Cancel',
				  style: 'cancel',
				},
				{
				  text: 'Update',
				  onPress: async () => {
					setIsLoading(true); 
					try {
					  await Updates.fetchUpdateAsync(); 
					  await Updates.reloadAsync();
					} catch (error) {
					  console.error('Error downloading update:', error);
					  setIsLoading(false);
					  Alert.alert('Update Error', 'There was an error updating the app.');
					}
				  },
				},
			  ],
			  { cancelable: false }
			);
		  }
		};
	
		checkForUpdates();
	  }, [isUpdateAvailable]);
	
	  useEffect(() => {
		const applyUpdate = async () => {
		  if (isUpdatePending) {
			setIsLoading(true);
			await Updates.reloadAsync();
		  }
		};
	
		applyUpdate();
	  }, [isUpdatePending]);
	
	  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
		? 'This app is running from built-in code'
		: 'This app is running an update';
	
	  if (isLoading) {
		return (
		  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" color="#003366" />
			<Text>Downloading update...</Text>
		  </View>
		);
	  }

	return (
		<AuthProvider>
			<PaperProvider>
				<StatusBar
					backgroundColor="#f0f0f0"
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
