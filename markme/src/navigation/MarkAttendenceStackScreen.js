

export default function MarkAttendenceStackScreen() {
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