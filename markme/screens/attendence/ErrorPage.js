import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ErrorPage({ route, navigation }) {
    const { message } = route.params;
    const scaleValue = new Animated.Value(0.8);
    const [fadeAnim] = React.useState(new Animated.Value(0));

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            navigation.navigate('attendence');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['#f7f7f7', '#ffffff']}
                style={styles.gradientContainer}
                >
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}>
                    <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={140}
                        color="#ff4d4d"
                        style={styles.crossIcon}
                        />
                </Animated.View>

                <Text style={styles.errorText}>
                    {message || 'Oops! Something went wrong.'}
                </Text>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('attendence')}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
                        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    gradientContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    iconContainer: {
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 100,
        padding: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    crossIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    errorText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 20,
    },
    backButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
