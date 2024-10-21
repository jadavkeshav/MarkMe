import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;

export default function DailyQuote() {
    const [quote, setQuote] = useState({
        text: "Loading...",
        author: "",
    });

    async function fetchQuote() {
        try {
            const res = await axios.get("http://192.168.1.4:8000/api/user/quote");
            setQuote(res.data);
        } catch (error) {
            console.error("Failed to fetch quote:", error);
            setQuote({
                text: "Stay positive, work hard, make it happen.",
                author: "Anonymous"
            });
        }
    }

    useEffect(() => {
        fetchQuote();
    }, []);

    return (
        <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>{quote.text}</Text>
            <Text style={styles.quoteAuthor}>- {quote.author}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    quoteContainer: {
        width: screenWidth - 40,
        backgroundColor: "#fff5e1",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    quoteText: {
        fontSize: 22,
        fontStyle: "italic",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    quoteAuthor: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#888",
        textAlign: "right",
        width: "100%",
    },
});
