import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Image } from 'react-native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import EmptyState from '../../components/EmptyState';

const typeImages = {
  Single: require('../../../assets/images/room_single.png'),
  Double: require('../../../assets/images/room_double.png'),
  Suite: require('../../../assets/images/room_suite.png'),
};

export default function AdminRoomListScreen({ navigation }) {
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'error', onConfirm: null, showCancel: false });

  const fetchRooms = useCallback(async () => {
    try { const res = await api.get('/rooms'); setRooms(res.data); }
    catch (e) { setAlert({ visible: true, title: 'Error', message: e.message, type: 'error' }); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, []);

  // Focus listener: refresh when coming back from form
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchRooms);
    return unsubscribe;
  }, [navigation]);

  const deleteRoom = (id, roomNum) => {
    setAlert({
      visible: true,
      title: 'Delete Room',
      message: `Delete Room ${roomNum}? This cannot be undone.`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try { 
          await api.delete(`/rooms/${id}`); 
          setAlert(p => ({ ...p, visible: false }));
          fetchRooms(); 
        } catch (e) { 
          setAlert({ visible: true, title: 'Error', message: e.response?.data?.message || e.message, type: 'error' }); 
        }
      }
    });
  };

  const statusColor = (s) => s === 'available' ? '#22c55e' : s === 'occupied' ? '#ef4444' : '#f59e0b';

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      {/* Add Room button */}
      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AdminRoomForm', { room: null })}>
        <Text style={s.addBtnText}>＋ Add New Room</Text>
      </TouchableOpacity>

      <FlatList
        data={rooms} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor="#00b4d8" />}
        renderItem={({ item: r }) => (
          <View style={s.card}>
            {r.image ? (
              <Image source={{ uri: `${api.defaults.baseURL.replace('/api','')}/uploads/rooms/${r.image}` }} style={s.roomImage} />
            ) : (
              <Image source={typeImages[r.type] || typeImages.Single} style={s.roomImage} />
            )}
            <View style={s.cardTop}>
              <View>
                <Text style={s.roomNum}>Room {r.roomNumber}</Text>
                <Text style={s.roomType}>{r.type} · Floor {r.floor} · Capacity {r.capacity}</Text>
                <Text style={s.price}>LKR {r.price?.toLocaleString()}/mo</Text>
              </View>
              <View style={[s.badge, { borderColor: statusColor(r.status), backgroundColor: statusColor(r.status) + '22' }]}>
                <Text style={[s.badgeText, { color: statusColor(r.status) }]}>{r.status}</Text>
              </View>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('AdminRoomForm', { room: r })}>
                <Text style={s.editText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => deleteRoom(r._id, r.roomNumber)}>
                <Text style={s.delText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState 
            icon="bed-outline" 
            title="No Rooms Yet" 
            message="Start by adding your first room to the hostel management system." 
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
  container: { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  addBtn:    { backgroundColor: '#00b4d8', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  card:      { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  roomImage: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12, resizeMode: 'cover' },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roomNum:   { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  roomType:  { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  price:     { fontSize: 14, color: '#00b4d8', marginTop: 4, fontWeight: '600' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  actions:   { flexDirection: 'row', gap: 10 },
  editBtn:   { flex: 1, backgroundColor: '#1d4ed822', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  editText:  { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  delBtn:    { flex: 1, backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  delText:   { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  empty:     { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 16 },
});
