import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Attendence from "../screens/Attendence";
import LocateUser from "../screens/attendence/LocateUser";
import SuccessPage from "../screens/attendence/SuccessPage";
import ErrorPage from "../screens/attendence/ErrorPage";

const AttendenceStack = createNativeStackNavigator();

const MarkAttendenceStackScreen = () => {
    return (
        <AttendenceStack.Navigator>
            <AttendenceStack.Screen name="attendence" component={Attendence} />
            <AttendenceStack.Screen name="locateuser" component={LocateUser} />
            <AttendenceStack.Screen name="success" component={SuccessPage} />
            <AttendenceStack.Screen name="error" component={ErrorPage} />
        </AttendenceStack.Navigator>
    );
};

export default MarkAttendenceStackScreen;
