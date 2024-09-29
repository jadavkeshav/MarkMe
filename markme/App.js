import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import Home from "./screens/Home";
import Attendence from "./screens/Attendence";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocateUser from "./screens/attendence/LocateUser";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Settings from "./screens/Settings";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const AttendenceStack = createNativeStackNavigator();

function MarkAttendenceStackScreen() {
	return (
		<AttendenceStack.Navigator initialRouteName="attendence">
			<AttendenceStack.Screen name="attendence" component={Attendence} />
			<AttendenceStack.Screen name="locateuser" component={LocateUser} />
		</AttendenceStack.Navigator>
	);
}

function HomeScreenDrawer() {
	return (
		<Drawer.Navigator
			screenOptions={{
				headerTitleStyle:{
					color: "#003366"
				},
				headerTintColor: '#003366',
				drawerLabelStyle: {
					fontSize: 18,
					color: "#003366",
				},
				drawerItemStyle: {
					marginVertical: 0,
					paddingLeft: 10,
					marginTop: 20
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
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
				}}
			/>
			<Drawer.Screen
				name="Settings"
				component={Settings}
				options={{
					drawerIcon: ({ color, size }) => <AntDesign name="setting" size={size} color={color} />,
				}}
			/>
		</Drawer.Navigator>
	);
}

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				initialRouteName="Home4"
				screenOptions={{
					headerShown: false,
					headerStyle:{
						color: "#003366",
					},
					tabBarLabelStyle: {
						color: "#003366",
						fontSize:16
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
						tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
						tabBarBadge: null,
					}}
				/>
				<Tab.Screen
					name="markme"
					component={MarkAttendenceStackScreen}
					options={{
						tabBarLabel: "Mark Me",
						tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={size} color={color} />,
						tabBarBadge: null,
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
