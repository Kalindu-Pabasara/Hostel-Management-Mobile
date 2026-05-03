import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, ActivityIndicator, Image } from 'react-native';
import api from '../../api/api';

const statusColors = { available:'#22c55e', occupied:'#ef4444', maintenance:'#f59e0b' };

const typeImages = {
  Single: require('../../../assets/images/room_single.png'),
  Double: require('../../../assets/images/room_double.png'),
  Suite: require('../../../assets/images/room_suite.png'),
};

export default function RoomListScreen({ navigation }) {
  const [rooms, setRooms]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (e) {
      console.log('Error fetching rooms:', e.message);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, []);

  // Filter + search whenever data or inputs change
  useEffect(() => {
    let data = rooms;
    if (filter !== 'all') data = data.filter(r => r.status === filter);
    if (search) data = data.filter(r =>
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [rooms, filter, search]);

  const renderRoom = ({ item: r }) => {
    let color = statusColors[r.status] || '#94a3b8';
    const freeBeds = r.joinableBeds ?? (r.capacity - (r.currentOccupancy || 0));
    let badgeText = r.status;

    // Custom badge logic based on user status and room availability
    if (r.userBookingStatus) {
      badgeText = r.userBookingStatus;
      color = r.userBookingStatus === 'Allocated' ? '#3b82f6' : '#f59e0b';
    } else if (r.type === 'Double' && freeBeds === 1) {
      badgeText = 'Join Room';
      color = '#10b981';
    } else if (freeBeds === 0) {
      badgeText = 'Full';
      color = '#ef4444';
    }

    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate('RoomDetail', { room: r })}>
        {r.image ? (
          <Image source={{ uri: `${api.defaults.baseURL.replace('/api','')}/uploads/rooms/${r.image}` }} style={s.roomImage} />
        ) : (
          <Image source={typeImages[r.type] || typeImages.Single} style={s.roomImage} />
        )}
        <View style={s.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.roomNum}>Room {r.roomNumber}</Text>
            <Text style={s.roomType}>{r.type} · Floor {r.floor}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[s.badgeText, { color }]}>{badgeText}</Text>
          </View>
        </View>
        <View style={s.cardFooter}>
          <Text style={s.price}>LKR {r.price?.toLocaleString()}/mo</Text>
          <Text style={[s.beds, { color: freeBeds > 0 ? '#22c55e' : '#ef4444' }]}>
            {freeBeds} bed{freeBeds !== 1 ? 's' : ''} free
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <TextInput
        style={s.search} placeholder="Search by room number or type..."
        placeholderTextColor="#64748b" value={search} onChangeText={setSearch}
      />
      <View style={s.filterRow}>
        {['all','available','occupied','maintenance'].map(f => (
          <TouchableOpacity key={f} style={[s.filterBtn, filter===f && s.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter===f && { color:'#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered} keyExtractor={i => i._id} renderItem={renderRoom}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor="#00b4d8" />}
        ListEmptyComponent={<Text style={s.empty}>No rooms found</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  search:       { backgroundColor: '#1e293b', borderRadius: 10, padding: 12, color: '#f1f5f9', marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  filterRow:    { flexDirection: 'row', gap: 6, marginBottom: 12 },
  filterBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  filterActive: { backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  filterText:   { color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' },
  card:         { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  roomImage:    { width: '100%', height: 160, borderRadius: 10, marginBottom: 12, resizeMode: 'cover' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon:         { fontSize: 28 },
  roomNum:      { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  roomType:     { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:    { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:        { fontSize: 15, fontWeight: '700', color: '#00b4d8' },
  beds:         { fontSize: 13, fontWeight: '600' },
  empty:        { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 16 },
});
