import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from "react-native-vector-icons";
import MarkAttendenceStackScreen from "./AttendenceStack";
import Home from "../screens/Home";
import { useAuth } from "../util/AuthContext";
import AuthStackScreen from "./AuthStack";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const MainNavigator = ({ isLoading, downloadProgress }) => {
    const { user } = useAuth();

    if (!user) {
        return <AuthStackScreen />;
    }

    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Mark Attendance"
                component={MarkAttendenceStackScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;
