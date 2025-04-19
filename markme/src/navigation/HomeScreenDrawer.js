import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "../screens/Home";
import Profile from "../screens/Profile";
import Settings from "../screens/Settings";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";


const Drawer = createDrawerNavigator();

export default function HomeScreenDrawer() {

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