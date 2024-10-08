import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Button({ children, onPress }) {
    return (
        <Pressable onPress={onPress}>
            <View style={styles.main}>
                <Text>{children}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    main: {

        margin: 30,
        backgroundColor: "#89ad",
    }
})
