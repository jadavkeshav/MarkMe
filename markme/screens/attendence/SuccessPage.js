import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SuccessPage({ route, navigation }) {
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
            <Animated.View style={[styles.container, { opacity: fadeAnim }]} >
                <LinearGradient
                    colors={['#e0ffe0', '#ffffff']}
                    style={styles.gradientContainer}
                >
                    <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}>
                        <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={140}
                            color="#4CAF50"
                            style={styles.successIcon}
                        />
                    </Animated.View>

                    <Text style={styles.successText}>
                        {message || 'Action completed successfully!'}
                    </Text>

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('attendence')}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    gradientContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: width, 
        height: height,
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
    successIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    successText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 20,
    },
    backButton: {
        backgroundColor: '#4CAF50',
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
