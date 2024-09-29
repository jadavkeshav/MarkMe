import React from "react";
import { Text, View, StyleSheet, Dimensions, FlatList } from "react-native";
import { CalendarList } from "react-native-calendars";
import Ionicons from "@expo/vector-icons/Ionicons";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const holidays = {
	"2024-01-26": { name: "Republic Day" },
	"2024-08-15": { name: "Independence Day" },
	"2024-10-02": { name: "Gandhi Jayanti" },
	"2024-12-25": { name: "Christmas" },
};

const tickMarkDates = ["2024-01-26", "2024-08-15"];

const notifications = [
	{ id: "1", message: "Your attendance has been marked successfully.", date: "2024-01-15" },
	{ id: "2", message: "New updates are available for the app.", date: "2024-01-16" },
	{ id: "3", message: "Don’t forget to complete your tasks!", date: "2024-01-17" },
	{ id: "4", message: "A meeting is scheduled for tomorrow at 10 AM.", date: "2024-01-18" },
	{ id: "5", message: "You have a new message from support.", date: "2024-01-19" },
	{ id: "6", message: "Your profile has been updated.", date: "2024-01-20" },
];

export default function Home() {
	const markedDates = {
		...Object.keys(holidays).reduce((acc, date) => {
			acc[date] = {
				customStyles: {
					container: { backgroundColor: "#FFDDC1" },
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
	};

	return (
		<View style={styles.container}>
			<View style={styles.calendarContainer}>
				<CalendarList
					horizontal={true}
					pagingEnabled={true}
					calendarWidth={screenWidth}
					markingType={"custom"}
					markedDates={markedDates}
					dayComponent={({ date, state }) => {
						const isHoliday = holidays[date.dateString];
						const isSunday = new Date(date.dateString).getDay() === 0;
						const isTicked = tickMarkDates.includes(date.dateString);

						return (
							<View style={styles.dayContainer}>
								{isTicked ? (
									<Ionicons name="checkmark-circle-outline" size={24} color="green" />
								) : isHoliday ? (
									<View style={styles.holidayContainer}>
										<Text style={styles.holidayText}>{date.day}</Text>
									</View>
								) : (
									<Text
										style={{
											color: isSunday ? "red" : state === "disabled" ? "gray" : "black",
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
					theme={{
						backgroundColor: "#ffffff",
						calendarBackground: "#ffffff",
						textSectionTitleColor: "#b6c1cd",
						selectedDayBackgroundColor: "#00adf5",
						selectedDayTextColor: "#ffffff",
						todayTextColor: "#00adf5",
						dayTextColor: "#2d4150",
						arrowColor: "orange",
						monthTextColor: "blue",
						textDayFontFamily: "monospace",
						textMonthFontFamily: "monospace",
						textDayHeaderFontFamily: "monospace",
						textDayFontWeight: "300",
						textMonthFontWeight: "bold",
						textDayHeaderFontWeight: "300",
					}}
				/>
			</View>

			<View style={styles.notificationContainer}>
				<Text style={styles.notificationTitle}>Notifications</Text>
				<FlatList
					data={notifications}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View style={styles.notificationItem}>
							<Text style={styles.notificationText}>{item.message}</Text>
							<Text style={styles.notificationDate}>{item.date}</Text>
						</View>
					)}
					contentContainerStyle={styles.notificationList}
					scrollEnabled={true} 
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	calendarContainer: {
		height: screenHeight * 0.5,
		width: screenWidth,
		justifyContent: "center",
		alignItems: "center",
	},
	notificationContainer: {
		flex: 1,
		height: screenHeight * 0.3,
		width: screenWidth,
		paddingVertical: 10,
		backgroundColor: "#f9f9f9",
		justifyContent: "center",
		alignItems: "center",
	},
	notificationList: {
		paddingBottom: 10,
		width: "90%",
		margin: 10,
	},
	notificationTitle: {
		fontSize: 25,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	notificationItem: {
		padding: 10,
		marginHorizontal: 1,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		borderRadius: 10,
		marginBottom: 10,
		height: 75,
		width: "100%",
		backgroundColor: "#ffffff",
		position: "relative",
	},
	notificationText: {
		fontSize: 16,
	},
	notificationDate: {
		position: "absolute",
		bottom: 5,
		right: 5,
		fontSize: 12,
		color: "lightgray",
	},
	textContainer: {
		height: screenHeight * 0.2,
		justifyContent: "center",
		alignItems: "center",
	},
	homeText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	dayContainer: {
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		width: 40,
	},
	holidayContainer: {
		backgroundColor: "green",
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
});
