import React, { useEffect, useLayoutEffect, useState } from "react";
import {
	Text,
	View,
	StyleSheet,
	Dimensions,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../util/AuthContext";

const screenWidth = Dimensions.get("window").width;

// const holidays = {
// 	"2024-01-26": { name: "Republic Day" },
// 	"2024-08-15": { name: "Independence Day" },
// 	"2024-10-02": { name: "Gandhi Jayanti" },
// 	"2024-12-25": { name: "Christmas" },
// };

const tickMarkDates = [
	"2024-01-26",
	"2024-08-15",
	"2024-10-15",
	"2024-10-05",
	"2024-10-07",
];

export default function Home() {

	const { user: { user }, getHolidays, getThisMonthHolidays, getUserAttendanceSummary } = useAuth();
	// let numberOfHolidays = 0;
	const [numberOfHolidays, setNumberOfHolidays] = useState(0);
	const [userAttendenceSummary, setUserAttendenceSummary] = useState({ "absentDays": 0, "presentDays": 0 });

	async function getData() {
		const hold = await getHolidays();
		setHolidays(hold)
		const res = await getThisMonthHolidays();
		console.log("Res : ", res.numberOfHolidays)
		setNumberOfHolidays(res.numberOfHolidays);
		const summary = await getUserAttendanceSummary();
		console.log("Summary : ", summary);
		setUserAttendenceSummary(summary.data);
	}





	useEffect(() => {
		getData();
	}, [user])


	const [holidays, setHolidays] = useState({})
	const navigation = useNavigation();
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
	const currentMonthDates = Array.from(
		{ length: daysInMonth },
		(_, i) => `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
	);

	const markedDates = {
		...Object.keys(holidays).reduce((acc, date) => {
			acc[date] = {
				customStyles: {
					container: { backgroundColor: "#FFE4B5" },
					text: { color: "blue", fontWeight: "bold" },
				},
			};
			return acc;
		}, {}),
		...tickMarkDates.reduce((acc, date) => {
			acc[date] = {
				customStyles: {
					container: { backgroundColor: "transparent" },
				},
			};
			return acc;
		}, {}),
		...currentMonthDates.reduce((acc, date) => {
			acc[date] = { marked: true };
			return acc;
		}, {}),
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{/* <Text style={styles.title}>Attendance Marking App</Text> */}

			<View style={styles.gridContainer}>
				<View style={styles.statBox}>
					<Text style={styles.statNumber}>{userAttendenceSummary.presentDays}</Text>
					<Text style={styles.statLabel}>Days Present</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statNumber}>{userAttendenceSummary.absentDays}</Text>
					<Text style={styles.statLabel}>Days Absent</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statNumber}>{numberOfHolidays}</Text>
					<Text style={styles.statLabel}>Holidays</Text>
				</View>
			</View>

			<View style={styles.calendarContainer}>
				<Calendar
					markingType={"custom"}
					markedDates={markedDates}
					theme={{
						backgroundColor: "#ffffff",
						calendarBackground: "#ffffff",
						textSectionTitleColor: "#b6c1cd",
						selectedDayBackgroundColor: "#00adf5",
						selectedDayTextColor: "#ffffff",
						todayTextColor: "#00adf5",
						dayTextColor: "#2d4150",
						arrowColor: "orange",
						monthTextColor: "#4A90E2",
						textDayFontFamily: "monospace",
						textMonthFontFamily: "monospace",
						textDayHeaderFontFamily: "monospace",
						textDayFontWeight: "400",
						textMonthFontWeight: "bold",
						textDayHeaderFontWeight: "400",
					}}
					dayComponent={({ date }) => {
						const isHoliday = holidays[date.dateString];
						const isTicked = tickMarkDates.includes(date.dateString);

						return (
							<View style={styles.dayContainer}>
								{isTicked ? (
									<Ionicons
										name="checkmark-circle-outline"
										size={24}
										color="green"
									/>
								) : isHoliday ? (
									<View style={styles.holidayContainer}>
										<Text style={styles.holidayText}>{date.day}</Text>
									</View>
								) : (
									<Text
										style={{
											color:
												date.dateString ===
													new Date().toISOString().split("T")[0]
													? "#00adf5"
													: "black",
											fontSize: 16,
											textAlign: "center",
										}}
									>
										{date.day}
									</Text>
								)}
							</View>
						);
					}}
				/>
			</View>

			<View style={styles.quickActionsContainer}>
				<Text style={styles.quickActionsTitle}>Quick Actions</Text>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => navigation.navigate("MarkAttendance")}
				>
					<Text style={styles.actionButtonText}>Mark Attendance</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => navigation.navigate("ViewReports")}>
					<Text style={styles.actionButtonText}>View Reports</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => navigation.navigate("LeaveRequests")}>
					<Text style={styles.actionButtonText}>Leave Requests</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Made for Everyone</Text>
				<Text style={styles.footerText}>© 2024 Attendance Marking App</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#f0f8ff",
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginVertical: 20,
		color: "#333",
	},
	gridContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	statBox: {
		backgroundColor: "#4a90e2",
		padding: 15,
		borderRadius: 10,
		width: "30%",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 4,
	},
	statNumber: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
	},
	statLabel: {
		fontSize: 14,
		color: "#fff",
	},
	calendarContainer: {
		marginBottom: 20,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 4,
	},
	dayContainer: {
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		width: 40,
	},
	holidayContainer: {
		backgroundColor: "#ff6347",
		borderRadius: 20,
		height: 30,
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	holidayText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	quickActionsContainer: {
		marginTop: 20,
		backgroundColor: "#ffffff",
		padding: 20,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 4,
	},
	quickActionsTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
		color: "#333",
	},
	actionButton: {
		backgroundColor: "#00adf5",
		padding: 10,
		borderRadius: 10,
		alignItems: "center",
		marginVertical: 5,
	},
	actionButtonText: {
		color: "#ffffff",
		fontSize: 16,
	},
	footer: {
		marginTop: 30,
		alignItems: "center",
	},
	footerText: {
		color: "#666",
		fontSize: 14,
	},
});
