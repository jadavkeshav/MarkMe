// AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { clearAllData } from './session';

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const apiURL = process.env.EXPO_PUBLIC_API_URL
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
                        const profileData = await AsyncStorage.getItem('user-profile');
                        const pData = JSON.parse(profileData);
                        setProfile(pData)
                    }
                }
            } catch (error) {
                console.error('Failed to load user data from AsyncStorage:', error);
            }
        };
        loadUser();
        // clearAllData();
    }, []);



    const login = async (username, password) => {
        try {
            const response = await axios.post(`${apiURL}/user/login`, {
                username,
                password,
            });

            if (response.data && response.data.user) {
                const userData = response.data;

                const pro = await axios.get(`${apiURL}/user/get-profile`, {
                    headers: {
                        "Authorization": `Bearer ${userData.token}`
                    }
                });

                // console.log("Second : ", pro)
                if (pro.data) {
                    const profileData = pro.data;
                    setProfile(pro.data);
                    await AsyncStorage.setItem('user-profile', JSON.stringify(profileData));
                    // console.log(profileData)
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

    async function getHolidays() {
		try {
			const response = await axios.get(`${apiURL}/user/get-holidays`, {
				headers: {
					"Authorization": `Bearer ${user?.token}`
				}
			});
            console.log("get holidays : ", response.data)
			return response?.data.holidays
		} catch (error) {
            console.error('get holidays error:', error);
            return {}

		}
	}

    async function getThisMonthHolidays() {
		try {
			const response = await axios.get(`${apiURL}/user/get-this-month-holidays`, {
				headers: {
					"Authorization": `Bearer ${user?.token}`
				}
			});
			console.log("Res of getThisMonthHolidays: ", response.data.numberOfHolidays)
            return response.data
		} catch (error) {
			console.error('get this month holidays error:', error.response.data);
			return 0
		}
	}

    async function getUserAttendanceSummary() {
		try {
			const response = await axios.get(`${apiURL}/user/get-attendance-summary`, {
				headers: {
					"Authorization": `Bearer ${user?.token}`
				}
			});
			console.log("User Attendence Summary : ", response.data)
            return response.data
		} catch (error) {
			console.error('User Attendence Summary :', error.response.data);
			return 0
		}
	}
    async function getUserAttendanceLastTwoWeeks() {
		try {
			const response = await axios.get(`${apiURL}/user/get-two-week-attendance`, {
				headers: {
					"Authorization": `Bearer ${user?.token}`
				}
			});
			console.log("User Attendence Summary : ", response.data)
            return response.data
		} catch (error) {
			console.error('User Attendence Summary :', error.response.data);
			return 0
		}
	}

    return (
        <AuthContext.Provider value={{ user, login, logout, getHolidays, getThisMonthHolidays, getUserAttendanceSummary, getUserAttendanceLastTwoWeeks}}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
