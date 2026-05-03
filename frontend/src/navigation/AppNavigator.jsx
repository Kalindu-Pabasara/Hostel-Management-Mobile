import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen           from '../screens/auth/LoginScreen';
import RegisterScreen        from '../screens/auth/RegisterScreen';

// Dashboards
import AdminDashboardScreen  from '../screens/dashboard/AdminDashboardScreen';
import StudentDashboardScreen from '../screens/dashboard/StudentDashboardScreen';

// Rooms
import RoomListScreen        from '../screens/rooms/RoomListScreen';
import RoomDetailScreen      from '../screens/rooms/RoomDetailScreen';
import AdminRoomListScreen   from '../screens/rooms/AdminRoomListScreen';
import AdminRoomFormScreen   from '../screens/rooms/AdminRoomFormScreen';
import BookRoomScreen        from '../screens/bookings/BookRoomScreen';
import MyBookingsScreen      from '../screens/bookings/MyBookingsScreen';
import AdminBookingsScreen   from '../screens/bookings/AdminBookingsScreen';

// Financials
import FeeStructureScreen    from '../screens/fees/FeeStructureScreen';
import FeePaymentScreen      from '../screens/fees/FeePaymentScreen';
import PaymentHistoryScreen  from '../screens/fees/PaymentHistoryScreen';

// Operations
import VisitorRegisterScreen from '../screens/visitors/VisitorRegisterScreen';
import VisitorHistoryScreen  from '../screens/visitors/VisitorHistoryScreen';
import AdminVisitorScreen    from '../screens/visitors/AdminVisitorScreen';
import MaintenanceFormScreen  from '../screens/maintenance/MaintenanceFormScreen';
import MyMaintenanceScreen    from '../screens/maintenance/MyMaintenanceScreen';
import AdminMaintenanceScreen from '../screens/maintenance/AdminMaintenanceScreen';

// Account
import ProfileScreen         from '../screens/profile/ProfileScreen';
import AdminUserListScreen   from '../screens/profile/AdminUserListScreen';
import UpdateProfileScreen from '../screens/profile/UpdateProfileScreen';

// Admin Special
import AdminRoomAllocateScreen from '../screens/rooms/AdminRoomAllocateScreen';
import AdminRegisterVisitorScreen from '../screens/visitors/AdminRegisterVisitorScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const H = { headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#f1f5f9' };

// ── Auth ──────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Admin sub-stacks ──────────────────────────────────────────
function AdminRoomsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="AdminRoomList" component={AdminRoomListScreen}  options={{ title: 'Manage Rooms' }} />
      <Stack.Screen name="AdminRoomForm" component={AdminRoomFormScreen}  options={{ title: 'Room Form' }} />
      <Stack.Screen name="RoomDetail"    component={RoomDetailScreen}     options={{ title: 'Room Detail' }} />
      <Stack.Screen name="AdminBookings" component={AdminBookingsScreen}  options={{ title: 'Room Allocations' }} />
      <Stack.Screen name="AdminRoomAllocate" component={AdminRoomAllocateScreen} options={{ title: 'Allocate Room' }} />
    </Stack.Navigator>
  );
}
function AdminFinancialsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Fee Payments' }} />
      <Stack.Screen name="FeeStructure"   component={FeeStructureScreen}   options={{ title: 'Fee Structure' }} />
      <Stack.Screen name="FeePayment"     component={FeePaymentScreen}     options={{ title: 'Record Payment' }} />
    </Stack.Navigator>
  );
}
function AdminOperationsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="AdminMaintenance" component={AdminMaintenanceScreen} options={{ title: 'Service Requests' }} />
      <Stack.Screen name="AdminVisitors"    component={AdminVisitorScreen}     options={{ title: 'Visitors' }} />
      <Stack.Screen name="AdminUserList"    component={AdminUserListScreen}    options={{ title: 'Manage Users' }} />
      <Stack.Screen name="AdminRegisterVisitor" component={AdminRegisterVisitorScreen} options={{ title: 'Register Visitor' }} />
    </Stack.Navigator>
  );
}

// ── Student sub-stacks ────────────────────────────────────────
function StudentRoomsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="RoomList"   component={RoomListScreen}   options={{ title: 'Room Availability' }} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Room Detail' }} />
      <Stack.Screen name="BookRoom"   component={BookRoomScreen}   options={{ title: 'Book Room' }} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Allocations' }} />
    </Stack.Navigator>
  );
}
function StudentFinancialsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Fee Payments' }} />
      <Stack.Screen name="FeeStructure"   component={FeeStructureScreen}   options={{ title: 'Fee Structure' }} />
      <Stack.Screen name="FeePayment"     component={FeePaymentScreen}     options={{ title: 'Pay Fee' }} />
    </Stack.Navigator>
  );
}
function StudentOperationsStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="MyMaintenance"   component={MyMaintenanceScreen}   options={{ title: 'Service Requests' }} />
      <Stack.Screen name="MaintenanceForm" component={MaintenanceFormScreen} options={{ title: 'Report Issue' }} />
      <Stack.Screen name="VisitorHistory"  component={VisitorHistoryScreen}  options={{ title: 'Visitor History' }} />
      <Stack.Screen name="VisitorRegister" component={VisitorRegisterScreen} options={{ title: 'Register Visitor' }} />
    </Stack.Navigator>
  );
}

// ── Shared Account Stack ──────────────────────────────────────
function AccountStack() {
  return (
    <Stack.Navigator screenOptions={H}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
}

// ── Admin Tabs ────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#00b4d8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Overview')        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Rooms')      iconName = focused ? 'bed'         : 'bed-outline';
          else if (route.name === 'Financials') iconName = focused ? 'card'        : 'card-outline';
          else if (route.name === 'Operations') iconName = focused ? 'build'       : 'build-outline';
          else                                  iconName = focused ? 'person'      : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview"   component={AdminDashboardScreen} options={{ headerShown: true, ...H, title: 'Dashboard' }} />
      <Tab.Screen name="Rooms"      component={AdminRoomsStack} />
      <Tab.Screen name="Financials" component={AdminFinancialsStack} />
      <Tab.Screen name="Operations" component={AdminOperationsStack} />
      <Tab.Screen name="Account"    component={AccountStack} />
    </Tab.Navigator>
  );
}

// ── Student Tabs ──────────────────────────────────────────────
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#00b4d8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Overview')        iconName = focused ? 'home'        : 'home-outline';
          else if (route.name === 'Rooms')      iconName = focused ? 'bed'         : 'bed-outline';
          else if (route.name === 'Financials') iconName = focused ? 'card'        : 'card-outline';
          else if (route.name === 'Operations') iconName = focused ? 'build'       : 'build-outline';
          else                                  iconName = focused ? 'person'      : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview"   component={StudentDashboardScreen} options={{ headerShown: true, ...H, title: 'Dashboard' }} />
      <Tab.Screen name="Rooms"      component={StudentRoomsStack} />
      <Tab.Screen name="Financials" component={StudentFinancialsStack} />
      <Tab.Screen name="Operations" component={StudentOperationsStack} />
      <Tab.Screen name="Account"    component={AccountStack} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {!user
        ? <AuthStack />
        : user.role === 'admin'
          ? <AdminTabs />
          : <StudentTabs />
      }
    </NavigationContainer>
  );
}
