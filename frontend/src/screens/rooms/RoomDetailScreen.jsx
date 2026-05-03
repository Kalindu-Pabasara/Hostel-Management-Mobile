import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const statusColors = { available:'#22c55e', occupied:'#ef4444', maintenance:'#f59e0b' };

const typeImages = {
  Single: require('../../../assets/images/room-single.png'),
  Double: require('../../../assets/images/room-double.png'),
  Suite: require('../../../assets/images/room-suite.png'),
};

export default function RoomDetailScreen({ route, navigation }) {
  const { room }  = route.params;
  const { isAdmin } = useAuth();
  const freeBeds  = room.joinableBeds ?? (room.capacity - (room.currentOccupancy || 0));
  const isFull    = freeBeds <= 0;
  const color     = statusColors[room.status] || '#94a3b8';

  const isDouble = room.type === 'Double';
  const displayPrice = isDouble ? room.price / 2 : room.price;

  return (
    <ScrollView style={s.container}>
      {/* Image */}
      {room.image ? (
        <Image source={{ uri: `${api.defaults.baseURL.replace('/api','')}/uploads/rooms/${room.image}` }} style={s.roomImage} />
      ) : (
        <Image source={typeImages[room.type] || typeImages.Single} style={s.roomImage} />
      )}

      <View style={s.body}>
        {/* Status + type */}
        <View style={s.row}>
          <Text style={s.type}>{room.type} · Floor {room.floor}</Text>
          <View style={[s.badge, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[s.badgeText, { color }]}>{room.status}</Text>
          </View>
        </View>

        {/* Price */}
        <Text style={s.price}>
          LKR {displayPrice?.toLocaleString()}
          <Text style={s.priceUnit}>/month{isDouble ? ' (per person)' : ''}</Text>
        </Text>

        {/* Bed stats */}
        <View style={s.statsRow}>
          {[['Capacity', room.capacity, '#f1f5f9'],
            ['Occupied', room.capacity - freeBeds, '#f59e0b'],
            ['Available', freeBeds, isFull ? '#ef4444' : '#22c55e']
          ].map(([label, val, c]) => (
            <View key={label} style={s.stat}>
              <Text style={[s.statVal, { color: c }]}>{val}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {!!room.description && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Description</Text>
            <Text style={s.desc}>{room.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Amenities</Text>
            <View style={s.chips}>
              {room.amenities.map((a, i) => (
                <View key={i} style={s.chip}><Text style={s.chipText}>✓ {a}</Text></View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        {!isAdmin() && (
          <TouchableOpacity
            style={[s.btn, (isFull || room.userBookingStatus) && s.btnDisabled]}
            onPress={() => {
              if (room.userBookingStatus) return Alert.alert('Notice', `You already have a ${room.userBookingStatus} request for this room.`);
              if (isFull) return Alert.alert('Full', 'This room has no free beds.');
              navigation.navigate('BookRoom', { room });
            }}
            disabled={isFull || !!room.userBookingStatus}
          >
            <Text style={s.btnText}>
              {room.userBookingStatus 
                ? `✅ ${room.userBookingStatus} to You`
                : isFull 
                  ? '🔒 Fully Booked' 
                  : (isDouble && freeBeds === 1 ? '🟡 Join Room' : '📋 Book Room')}
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin() && (
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('AdminRoomForm', { room })}>
            <Text style={s.btnText}>✏️ Edit Room</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a' },
  roomImage:   { width: '100%', height: 220, resizeMode: 'cover' },
  body:        { padding: 20 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  type:        { fontSize: 15, color: '#94a3b8' },
  badge:       { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:   { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  price:       { fontSize: 28, fontWeight: '800', color: '#00b4d8', marginBottom: 20 },
  priceUnit:   { fontSize: 15, color: '#94a3b8' },
  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 24 },
  stat:        { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statVal:     { fontSize: 24, fontWeight: '800' },
  statLabel:   { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 10 },
  desc:        { color: '#94a3b8', lineHeight: 22 },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#334155' },
  chipText:    { color: '#00b4d8', fontSize: 13 },
  btn:         { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#334155' },
  editBtn:     { backgroundColor: '#f59e0b', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
