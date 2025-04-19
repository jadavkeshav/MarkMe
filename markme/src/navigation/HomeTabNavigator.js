import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react'
import HomeScreenDrawer from './HomeScreenDrawer';
import MarkAttendenceStackScreen from './AttendenceStack';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

export default function HomeTabNavigator() {
    return (
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
    )
}
