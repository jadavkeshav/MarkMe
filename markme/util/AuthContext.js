// AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    if (parsedData.token) {
                        setUser(parsedData);
                    }
                }
            } catch (error) {
                console.error('Failed to load user data from AsyncStorage:', error);
            }
        };
        loadUser();
    }, []);
    
    const login = async (username, password) => {
        try {
            const response = await axios.post('http://192.168.1.5:8000/api/user/login', {
                username,
                password,
            });

            if (response.data && response.data.user) {
                const userData = response.data;

                const pro = await axios.get('http://192.168.1.5:8000/api/user/get-profile', {
                   headers:{
                    "Authorization" : `Bearer ${userData.token}`
                   }
                });

                if (pro.data) {
                    const profileData = pro.data;
                    setProfile(pro.data);
                    await AsyncStorage.setItem('user', JSON.stringify(profileData));
                }

                setUser(userData);
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                return true;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
