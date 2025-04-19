import React, { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { StatusBar, Text, Touchable, View } from "react-native";
import { AuthProvider, useAuth } from "./src/util/AuthContext";
import { clearAllData } from "./src/util/session";
import axios from "axios";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthStackScreen from "./src/navigation/AuthStack";
import HomeTabNavigator from "./src/navigation/HomeTabNavigator";
import * as Updates from 'expo-updates';

async function logData() {
    const user = await AsyncStorage.getItem("user");
    console.log("storage : ", user);
}
logData();

function MainNavigator() {
    const { user } = useAuth();
    const apiURL = process.env.EXPO_PUBLIC_API_URL
    const navigation = useNavigation();

    const checkJWT = async () => {
        try {
            const response = await axios.get(`${apiURL}/user/check`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log("Token expired, logging out...");
                clearAllData();
                navigation.navigate("login");
            } else {
                console.log("Error checking JWT : ", error);
                clearAllData();
                navigation.navigate("login");
            }
        }
    };

    useEffect(() => {
        if (user?.token) {
            const interval = setInterval(() => {
                checkJWT();
                console.log("Check : ", user?.token);
            }, 60000);
            return () => clearInterval(interval);
        }
        checkJWT();
    }, [user]);

    return !user ? (
        <AuthStackScreen />
    ) : (
        <HomeTabNavigator />
    );
}

export default function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        const checkForUpdates = async () => {
            if (isUpdateAvailable) {
                Alert.alert(
                    'Update Available',
                    'A new update is available. Would you like to download it?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Update',
                            onPress: async () => {
                                setIsLoading(true);
                                setDownloadProgress(0);
                                try {
                                    const interval = setInterval(() => {
                                        setDownloadProgress((prev) => Math.min(prev + 10, 100));
                                    }, 300);

                                    await Updates.fetchUpdateAsync();
                                    clearInterval(interval);
                                    setDownloadProgress(100);
                                    await Updates.reloadAsync();
                                } catch (error) {
                                    console.error('Error downloading update:', error);
                                    setIsLoading(false);
                                    Alert.alert('Update Error', 'There was an error updating the app.');
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        };

        checkForUpdates();
    }, [isUpdateAvailable]);

    useEffect(() => {
        const applyUpdate = async () => {
            if (isUpdatePending) {
                setIsLoading(true);
                await Updates.reloadAsync();
            }
        };

        applyUpdate();
    }, [isUpdatePending]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color="#003366" />
                <Text style={{ marginTop: 20, fontSize: 18, color: "#003366" }}>Downloading update...</Text>
                <ProgressBarAndroid
                    styleAttr="Horizontal"
                    indeterminate={false}
                    progress={downloadProgress / 100}
                    color="#003366"
                    style={{ width: '80%', marginTop: 20 }}
                />
                <Text style={{ marginTop: 10, fontSize: 16 }}>{`${downloadProgress}%`}</Text>
            </View>
        );
    }

    return (
        <AuthProvider>
            <PaperProvider>
                <StatusBar
                    backgroundColor="#f0f0f0"
                    color="black"
                    barStyle="dark-content"
                />
                <StatusBar style="light" />
                <NavigationContainer>
                    <MainNavigator />
                </NavigationContainer>
            </PaperProvider>
        </AuthProvider>
    );
}
