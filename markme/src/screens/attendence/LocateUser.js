import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../util/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

const centerCoordinates = {
  // latitude: 17.397112487344824,
  // longitude: 78.49016531263395,
  latitude: 17.397126394634512,
  longitude: 78.51397876618095,
};

const RADIUS = 57.30; // meters

const haversine = (coords1, coords2) => {
  const R = 6371; // Radius of the Earth in km
  const toRad = (value) => (value * Math.PI) / 180;
  const φ1 = toRad(coords1.latitude);
  const φ2 = toRad(coords2.latitude);
  const Δφ = toRad(coords2.latitude - coords1.latitude);
  const Δλ = toRad(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // Distance in meters
};

export default function LocateUser({ route, navigation }) {
  const { user } = useAuth();
  const isVerified = route.params?.isVerified;
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  async function fetchUserLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
    setDistance(haversine(centerCoordinates, location.coords));
  }

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const checkLocation = async () => {
    if (userLocation && isVerified) {
      setLoading(true);
      const calculatedDistance = haversine(centerCoordinates, userLocation);
      setDistance(calculatedDistance);

      if (calculatedDistance <= RADIUS) {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/mark-attendance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify({ location: userLocation }),
          });

          const result = await response.json();

          if (result.success) {
            navigation.navigate("success", { message: result.message });
          } else {
            navigation.navigate("error", { message: result.message });
          }
        } catch (error) {
          navigation.navigate("error", { message: "An error occurred while marking attendance." });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigation.navigate("error", { message: "You are outside the allowed radius." });
      }
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>
          <FontAwesome name="exclamation-circle" size={20} color="red" /> {errorMsg}
        </Text>
      ) : (
        <>
          <Text style={styles.title}>Mark Your Attendance</Text>

          {distance !== null && (
            <Text style={distance <= RADIUS ? styles.insideRadius : styles.outsideRadius}>
              {distance <= RADIUS ? "You are within the allowed location!" : "You are outside the allowed radius."}
            </Text>
          )}
          <Text style={styles.distance}>
            {distance !== null ? `Distance: ${distance.toFixed(2)} meters` : 'Calculating distance...'}
          </Text>
          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={checkLocation}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Mark Attendance</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
      <View style={styles.footer}>
        <Text style={styles.copyright}>© 2024 MarkMe by JadavKeshav. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
		backgroundColor: "#f0f0f0",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginVertical: 20,
    textAlign: 'center',
  },
  distance: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999999',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  insideRadius: { color: 'green', fontSize: 16, fontWeight: 'bold' },
  outsideRadius: { color: 'red', fontSize: 16, fontWeight: 'bold' },
});
