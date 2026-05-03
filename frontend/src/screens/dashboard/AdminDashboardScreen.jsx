import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, available: 0, occupied: 0, maintenance: 0, occPct: 0,
    totalIncome: 0, pendingPayments: 0, activeRequests: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [resRooms, resPay, resMaint] = await Promise.all([
        api.get('/rooms'),
        api.get('/fees/payments'),
        api.get('/maintenance')
      ]);
      
      const rooms = resRooms.data;
      const total = rooms.length;
      const available = rooms.filter(r => r.currentOccupancy < r.capacity && r.status !== 'maintenance').length;
      const occupied = rooms.filter(r => (r.currentOccupancy || 0) > 0).length;
      const maintenance = rooms.filter(r => r.status === 'maintenance').length;
      const occPct = total ? Math.round((occupied / total) * 100) : 0;

      const totalIncome = resPay.data.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = resPay.data.filter(p => p.status === 'pending').length;
      const activeRequests = resMaint.data.filter(m => m.status !== 'resolved').length;

      setStats({ total, available, occupied, maintenance, occPct, totalIncome, pendingPayments, activeRequests });
    } catch (err) {
      console.log('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  return (
    <ScrollView 
      style={s.wrapper} 
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor="#00b4d8" />}
    >
      <View style={s.container}>
        <Text style={s.greeting}>Welcome back,</Text>
        <Text style={s.name}>{user?.name || 'Admin'}</Text>
        <Text style={s.subtitle}>Here is your hostel overview today.</Text>

        <Text style={s.sectionTitle}>Room Occupancy Overview</Text>
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#34d399" />
            </View>
            <Text style={s.statValue}>{stats.available}</Text>
            <Text style={s.statLabel}>Available</Text>
          </View>
          
          <View style={s.statCard}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Ionicons name="close-circle" size={24} color="#f87171" />
            </View>
            <Text style={s.statValue}>{stats.occupied}</Text>
            <Text style={s.statLabel}>Occupied</Text>
          </View>

          <View style={s.statCard}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Ionicons name="build" size={24} color="#fbbf24" />
            </View>
            <Text style={s.statValue}>{stats.maintenance}</Text>
            <Text style={s.statLabel}>Maintenance</Text>
          </View>

          <View style={s.statCard}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(0,180,216,0.15)' }]}>
              <Ionicons name="pie-chart" size={24} color="#00b4d8" />
            </View>
            <Text style={s.statValue}>{stats.occPct}%</Text>
            <Text style={s.statLabel}>Occupancy</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Operations & Finance</Text>
        <View style={s.statsGrid}>
          <View style={[s.statCard, { width: '100%', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 }]}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.statValue, { color: '#22c55e' }]}>LKR {stats.totalIncome.toLocaleString()}</Text>
              <Text style={s.statLabel}>Total Revenue</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#334155', height: '100%' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.statValue, { color: '#f59e0b' }]}>{stats.pendingPayments}</Text>
              <Text style={s.statLabel}>Pending Fees</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#334155', height: '100%' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.statValue, { color: '#ef4444' }]}>{stats.activeRequests}</Text>
              <Text style={s.statLabel}>Open Issues</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.grid}>
          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Operations', { screen: 'AdminVisitors' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="people" size={28} color="#8b5cf6" />
            </View>
            <Text style={s.cardTitle}>Visitors</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Operations', { screen: 'AdminMaintenance' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#ef444420' }]}>
              <Ionicons name="build" size={28} color="#ef4444" />
            </View>
            <Text style={s.cardTitle}>Maintenance</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Rooms', { screen: 'AdminBookings' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="calendar" size={28} color="#10b981" />
            </View>
            <Text style={s.cardTitle}>Allocations</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Operations', { screen: 'AdminUserList' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#00b4d820' }]}>
              <Ionicons name="people-circle" size={28} color="#00b4d8" />
            </View>
            <Text style={s.cardTitle}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Rooms', { screen: 'AdminRoomAllocate' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="add-circle" size={28} color="#10b981" />
            </View>
            <Text style={s.cardTitle}>Allocate Room</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Financials', { screen: 'PaymentHistory' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="card" size={28} color="#f59e0b" />
            </View>
            <Text style={s.cardTitle}>Financials</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.actionCard}
            onPress={() => navigation.navigate('Operations', { screen: 'AdminRegisterVisitor' })}
          >
            <View style={[s.iconBox, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="person-add" size={28} color="#8b5cf6" />
            </View>
            <Text style={s.cardTitle}>Register Visitor</Text>
          </TouchableOpacity>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { 
    width: '48%', backgroundColor: '#1e293b', borderRadius: 16, 
    padding: 16, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  actionCard: { 
    flex: 1, minWidth: '30%', backgroundColor: '#1e293b', borderRadius: 16, 
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155'
  },
  iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#e2e8f0', textAlign: 'center' }
});
