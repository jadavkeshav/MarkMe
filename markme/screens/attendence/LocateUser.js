import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const centerCoordinates = {
  // latitude: 17.397313152389106,
  // longitude: 78.49023979337854,
  latitude: 17.397167580798143,
  longitude: 78.51400323189831,
};

const RADIUS = 1000; //--- > 1-KM

const haversine = (coords1, coords2) => {
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

  return R * c; 
};

export default function LocateUser({ route, navigation }) {
  let isVerified = route.params?.isVerified;
  console.log("ISVERI : ", isVerified)
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  async function fetchUserLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    console.log("STATUS : ", status)

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
    console.log("LOC : ", location.coords);
  }

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const checkLocation = async () => {
    console.log("PRESSES")
    if (userLocation && isVerified) {
      await fetchUserLocation();
      const distance = haversine(centerCoordinates, userLocation);
      if (distance <= RADIUS) {
        console.log("SUCCESS");
        navigation.navigate("success")

      } else {
        console.log("ERROR")
        navigation.navigate("error")
      }
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <>
          {userLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: centerCoordinates.latitude,
                longitude: centerCoordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={centerCoordinates} title="Center Point" />
              <Marker coordinate={userLocation} title="Your Location" />
            </MapView>
          ) : <MapView
            style={styles.map}
            initialRegion={{
              latitude: centerCoordinates.latitude,
              longitude: centerCoordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={centerCoordinates} title="Center Point" />
          </MapView>}
          <TouchableOpacity style={styles.button} onPress={checkLocation}>
            <Text style={styles.buttonText}>Locate</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  map: {
    width: '100%',
    height: '70%',
    borderRadius: 10, 
    overflow: 'hidden', 
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6200EE', 
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
