# 🏨 HostelMS — Mobile Hostel Management System

A high-performance, full-stack mobile application for managing hostel operations, built with **React Native**, **Node.js**, and **MongoDB Atlas**.

## 📌 Project Overview
HostelMS simplifies hostel administration and student life by digitizing room discovery, allocations, maintenance, and fee tracking. It features a premium dark-themed UI with role-based access for Admins and Students.

### 🏗️ Tech Stack
*   **Frontend**: React Native (Expo SDK 50+), Expo Router.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB Atlas (Cloud).
*   **Security**: JWT (Authentication), Bcrypt (Password Hashing).
*   **Storage**: Multer (Local/Server storage for room images and payment proofs).

---

## 📁 Project Structure
```
📦 Hostel-Management-System
├── backend/               # Node.js Express API
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # REST API Endpoints
│   ├── middleware/        # JWT & Auth logic
│   └── server.js          # Entry Point
└── frontend/              # React Native Mobile App
    ├── src/
    │   ├── api/           # Axios config
    │   ├── components/    # Reusable UI elements
    │   ├── context/       # Auth state management
    │   ├── navigation/    # App flow
    │   └── screens/       # Application pages
    └── app.json           # Expo configuration
```

---

## ✨ Key Features

### 🔐 Authentication & Security
*   **JWT-based Security**: Secure session management for all users.
*   **Role-Based Access**: Specialized dashboards for Admins and Students.
*   **Profile Management**: In-app profile updates for phone numbers and passwords.

### 🏠 Room & Allocation
*   **Live Availability**: Real-time tracking of room occupancy and bed capacity.
*   **Booking Workflow**: Student booking requests with Admin approval/rejection.
*   **Direct Allocation**: Admins can directly assign rooms to students.

### 🔧 Maintenance & Visitors
*   **Service Requests**: Ticket-based system with priority levels (Low → Urgent).
*   **Visitor Logs**: Digital registration for visitors linked to student hosts.

### 💳 Financial Management
*   **Fee Ledger**: Complete history of student payments and pending fees.
*   **Digital Receipts**: Image upload functionality for payment proof verification.

### 🎨 UI/UX Excellence
*   **Premium Dark Mode**: Modern, high-contrast aesthetic.
*   **Custom Alerts**: Unified design for all system feedback and warnings.
*   **Empty State UI**: Professional illustrations for empty lists/data.

---




## 📄 License
This project is for academic purposes at SLIIT (WMT Module).
