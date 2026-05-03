import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export default function StudentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [allocatedRoom, setAllocatedRoom] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAlloc, resPay, resVis, resMaint] = await Promise.all([
        api.get('/bookings'),
        api.get('/fees/payments'),
        api.get('/visitors'),
        api.get('/maintenance')
      ]);

      const approved = resAlloc.data.find(b => b.status === 'approved');
      setAllocatedRoom(approved?.roomId || null);

      setRecentPayments(resPay.data.slice(0, 3));
      setRecentVisitors(resVis.data.slice(0, 3));
      setRecentMaintenance(resMaint.data.slice(0, 3));
    } catch (err) {
      console.log('Error fetching dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDashboardData(); }, [fetchDashboardData]));

  const actions = [
    { title: 'My Visitors', icon: 'people', color: '#8b5cf6', screen: 'Operations', params: { screen: 'VisitorHistory' } },
    { title: 'Book a Room', icon: 'bed', color: '#00b4d8', screen: 'Rooms', params: { screen: 'RoomList' } },
    { title: 'My Bookings', icon: 'calendar', color: '#10b981', screen: 'Rooms', params: { screen: 'MyBookings' } },
    { title: 'Pay Fees', icon: 'card', color: '#f59e0b', screen: 'Financials', params: { screen: 'FeePayment' } },
    { title: 'My Requests', icon: 'build', color: '#ef4444', screen: 'Operations', params: { screen: 'MyMaintenance' } },
  ];

  const renderStatus = (s) => {
    let c = '#94a3b8';
    if(s === 'paid' || s === 'approved' || s === 'resolved') c = '#22c55e';
    if(s === 'pending' || s === 'in-progress') c = '#f59e0b';
    if(s === 'rejected' || s === 'cancelled') c = '#ef4444';
    return <View style={[s.miniBadge, { backgroundColor: c+'22', borderColor: c }]}><Text style={[s.miniBadgeText, { color: c }]}>{s}</Text></View>;
  };

  return (
    <ScrollView style={s.wrapper} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor="#00b4d8" />}>
      <View style={s.container}>
        <Text style={s.greeting}>Hello,</Text>
        <Text style={s.name}>{user?.name || 'Student'}</Text>
        <Text style={s.subtitle}>Welcome to the Hostel Management System</Text>

        {allocatedRoom && (
          <View style={s.allocationCard}>
            <View style={s.allocIconBox}><Ionicons name="key" size={28} color="#22c55e" /></View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.allocLabel}>Your Allocated Room</Text>
              <Text style={s.allocRoom}>Room {allocatedRoom.roomNumber}</Text>
              <Text style={s.allocDetail}>{allocatedRoom.type} • Floor {allocatedRoom.floor ?? 'N/A'}</Text>
            </View>
          </View>
        )}

        <Text style={s.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 }}>
          {actions.map((act, i) => (
            <TouchableOpacity key={i} style={s.hCard} onPress={() => navigation.navigate(act.screen, act.params)}>
              <View style={[s.iconBox, { backgroundColor: `${act.color}20` }]}><Ionicons name={act.icon} size={28} color={act.color} /></View>
              <Text style={s.cardTitle}>{act.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.sectionTitle}>Recent Payments</Text>
        <View style={s.listCard}>
          {recentPayments.length === 0 ? <Text style={s.emptyList}>No payments yet</Text> : recentPayments.map(p => (
            <View key={p._id} style={s.listItem}>
              <View><Text style={s.itemTitle}>{p.feeType}</Text><Text style={s.itemSub}>LKR {p.amount}</Text></View>
              {renderStatus(p.status)}
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>My Visitors</Text>
        <View style={s.listCard}>
          {recentVisitors.length === 0 ? <Text style={s.emptyList}>No visitors yet</Text> : recentVisitors.map(v => (
            <View key={v._id} style={s.listItem}>
              <View><Text style={s.itemTitle}>{v.visitorName}</Text><Text style={s.itemSub}>{new Date(v.visitDate).toLocaleDateString()}</Text></View>
              {renderStatus(v.status)}
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Recent Maintenance</Text>
        <View style={s.listCard}>
          {recentMaintenance.length === 0 ? <Text style={s.emptyList}>No requests yet</Text> : recentMaintenance.map(m => (
            <View key={m._id} style={s.listItem}>
              <View>
                <Text style={s.itemTitle}>{m.category?.toUpperCase()} · Room {m.roomNumber}</Text>
                <Text style={s.itemSub}>{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </View>
              {renderStatus(m.status)}
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20 },
  greeting: { fontSize: 16, color: '#94a3b8', marginTop: 10 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f1f5f9', marginBottom: 16 },
  hCard: { width: 120, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginRight: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#e2e8f0', textAlign: 'center' },
  listCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155', paddingVertical: 12 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#f8fafc', marginBottom: 4 },
  itemSub: { fontSize: 13, color: '#94a3b8' },
  emptyList: { textAlign: 'center', color: '#64748b', paddingVertical: 10 },
  miniBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  miniBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  allocationCard: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#22c55e', alignItems: 'center' },
  allocIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#22c55e20', justifyContent: 'center', alignItems: 'center' },
  allocLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  allocRoom: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  allocDetail: { fontSize: 14, color: '#cbd5e1' }
});
