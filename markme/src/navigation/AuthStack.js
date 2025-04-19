import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";

const AuthStack = createNativeStackNavigator();

const AuthStackScreen = () => {
    return (
        <AuthStack.Navigator initialRouteName="login">
            <AuthStack.Screen name="login" component={Login} options={{ headerShown: false }} />
        </AuthStack.Navigator>
    );
};

export default AuthStackScreen;
