
# MarkMe - Location-based Attendance Marking Application

## Overview

MarkMe is a modern location-based mobile application that enables efficient and secure attendance marking. Built using a powerful tech stack including React Native, Node.js, Express.js, and MongoDB, it ensures only users within a specified location and time range can mark their attendance. It includes additional functionality such as a holiday calendar, detailed attendance statistics, and biometric authentication for added security.

---

## Features

* 📍  **Location-based Attendance Marking** : Users can only mark attendance if they're within a predefined geofence.
* 📅  **Holiday Calendar** : Shows upcoming holidays and non-working days.
* 📊  **Attendance Statistics** : View attendance history, monthly overviews, and missed days.
* 🔐  **Biometric Authentication** : Fingerprint and facial recognition support for secure access.
* 🔑  **JWT Authentication** : JSON Web Tokens for secure user sessions.
* ☁️  **Cloud-based Backend** : Node.js, Express.js, and MongoDB power a secure backend to manage users, logs, and attendance records.

---

## Tech Stack

* **Frontend** :
  * React Native
    * React Navigation
    * React Native Paper
    * Axios
    * MaterialCommunityIcons & AntDesign
* **Backend** :
  * Node.js
  * Express.js
  * MongoDB
  * JWT Authentication

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/markme.git
cd markme
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the App

```bash
npx react-native run-android   # For Android
npx react-native run-ios       # For iOS
```

### 4. Setup Environment for Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory:

```env

MONGO_URI=your_mongodb_connection_uri
PORT=your_port_number
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

---

## Contributing

Open to all contributors! Feel free to fork, raise issues, and submit pull requests to enhance MarkMe.

---

## Notes

* Replace `your_mongodb_connection_uri, your_port_number` and `your_jwt_secret_key` with your own values.
* All frontend and backend code are housed in the same repository under appropriate folders.
* Icons used above are from [Icons8](https://icons8.com/).

---
