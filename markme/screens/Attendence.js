import React from "react";
import { Button, Text } from "react-native";

export default function Attendence({ navigation }) {
	return <Button title="press me" onPress={() => navigation.navigate("Settings")} />;
}
