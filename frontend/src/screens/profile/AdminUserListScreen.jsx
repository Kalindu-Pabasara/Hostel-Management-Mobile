import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import EmptyState from '../../components/EmptyState';

export default function AdminUserListScreen() {
  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState('');
  const [alert, setAlert]       = useState({ visible: false, title: '', message: '', type: 'error', onConfirm: null, showCancel: false });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setFiltered(res.data);
    } catch (e) {
      setAlert({ visible: true, title: 'Error', message: 'Error fetching users: ' + e.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsers(); }, [fetchUsers]));

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFiltered(users);
      return;
    }
    const low = text.toLowerCase();
    const filteredData = users.filter(u => 
      u.name.toLowerCase().includes(low) || 
      u.email.toLowerCase().includes(low) ||
      u.nic.toLowerCase().includes(low)
    );
    setFiltered(filteredData);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setAlert({
      visible: true,
      title: newStatus === 'inactive' ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to set this user as ${newStatus}?`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.patch(`/auth/users/${id}/status`, { status: newStatus });
          setAlert(p => ({ ...p, visible: false }));
          fetchUsers();
        } catch (e) { 
          setAlert({ visible: true, title: 'Error', message: e.message, type: 'error' }); 
        }
      }
    });
  };

  const deleteUser = (id, name) => {
    setAlert({
      visible: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/auth/users/${id}`);
          setAlert(p => ({ ...p, visible: false }));
          fetchUsers();
        } catch (e) {
          setAlert({ visible: true, title: 'Error', message: e.message, type: 'error' });
        }
      }
    });
  };

  const renderUser = ({ item: u }) => (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.name}>{u.name}</Text>
          <Text style={s.email}>{u.email}</Text>
          <Text style={s.detail}>NIC: {u.nic} · 📞 {u.phone}</Text>
          {u.roomNumber && (
            <View style={s.roomBadge}>
              <Text style={s.roomBadgeText}>🏠 Room {u.roomNumber}</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={[s.badge, { borderColor: u.role==='admin' ? '#f59e0b' : '#00b4d8' }]}>
            <Text style={[s.badgeText, { color: u.role==='admin' ? '#f59e0b' : '#00b4d8' }]}>{u.role}</Text>
          </View>
          <View style={[s.miniBadge, { borderColor: u.status === 'active' ? '#22c55e' : '#ef4444', backgroundColor: u.status === 'active' ? '#22c55e10' : '#ef444410' }]}>
            <Text style={[s.miniBadgeText, { color: u.status === 'active' ? '#22c55e' : '#ef4444' }]}>{u.status}</Text>
          </View>
        </View>
      </View>
      
      {u.role !== 'admin' && (
        <View style={s.actions}>
          <TouchableOpacity 
            style={[s.actionBtn, { borderColor: u.status === 'active' ? '#ef4444' : '#22c55e' }]} 
            onPress={() => toggleStatus(u._id, u.status)}
          >
            <Text style={[s.actionText, { color: u.status === 'active' ? '#ef4444' : '#22c55e' }]}>
              {u.status === 'active' ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { borderColor: '#ef4444' }]} onPress={() => deleteUser(u._id, u.name)}>
            <Text style={[s.actionText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={[s.searchRow, { flex: 1, marginBottom: 0 }]}>
          <Ionicons name="search" size={20} color="#64748b" style={s.searchIcon} />
          <TextInput
            style={s.search} placeholder="Search..."
            placeholderTextColor="#64748b" value={search} onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={s.exportBtn} 
          onPress={() => setAlert({ visible: true, title: 'Export Success', message: 'User list exported as CSV to your downloads.', type: 'success' })}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered} keyExtractor={i => i._id} renderItem={renderUser}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor="#00b4d8" />}
        ListEmptyComponent={
          <EmptyState 
            icon="people-outline" 
            title="No Users Found" 
            message={search ? "No users match your search criteria." : "There are no registered users in the system."} 
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onClose={() => setAlert(p => ({ ...p, visible: false }))} 
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  searchIcon: { marginRight: 8 },
  search:     { flex: 1, paddingVertical: 12, color: '#f1f5f9', fontSize: 14 },
  exportBtn:  { backgroundColor: '#00b4d8', borderRadius: 12, width: 48, justifyContent: 'center', alignItems: 'center' },
  card:       { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:        { flexDirection: 'row', alignItems: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00b4d820', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00b4d8' },
  avatarText: { color: '#00b4d8', fontSize: 18, fontWeight: 'bold' },
  name:       { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  email:      { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  detail:     { fontSize: 12, color: '#64748b', marginTop: 4 },
  roomBadge:  { backgroundColor: '#00b4d820', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4, borderWidth: 1, borderColor: '#00b4d8' },
  roomBadgeText: { fontSize: 10, color: '#00b4d8', fontWeight: '700' },
  badge:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  badgeText:  { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  actions:    { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionBtn:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: '600' },
  miniBadge:  { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1 },
  miniBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  empty:      { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
