import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookRoomScreen({ route, navigation }) {
  const { room }  = route.params;
  const { user }  = useAuth();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate,   setEndDate]   = useState(new Date(new Date().setMonth(new Date().getMonth() + 6))); // Default 6 months
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);
  
  const [notes,     setNotes]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [alert,     setAlert]     = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const handleBook = async () => {
    if (startDate >= endDate) return showAlert('Error', 'End date must be after start date.');
    setLoading(true);
    try {
      await api.post('/bookings', { 
        roomId: room._id, 
        startDate: startDate.toISOString().split('T')[0], 
        endDate: endDate.toISOString().split('T')[0], 
        notes 
      });
      showAlert('✅ Success', 'Booking request submitted! Waiting for admin approval.', 'success', () => {
        setAlert(prev => ({ ...prev, visible: false }));
        navigation.navigate('RoomList');
      });
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.roomCard}>
          <Text style={s.roomNum}>Room {room.roomNumber}</Text>
          <Text style={s.roomType}>{room.type} · Floor {room.floor}</Text>
          <Text style={s.roomPrice}>
            LKR {(room.type === 'Double' ? room.price / 2 : room.price)?.toLocaleString()}/month 
            {room.type === 'Double' ? ' (per person)' : ''}
          </Text>
        </View>

        <Text style={s.heading}>Booking Details</Text>

        <Text style={s.label}>Start Date</Text>
        <TouchableOpacity style={s.dateInput} onPress={() => setShowStartPicker(true)}>
          <Text style={s.dateText}>{startDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate} mode="date" display="default"
            onChange={(e, date) => { setShowStartPicker(false); if (date) setStartDate(date); }}
          />
        )}

        <Text style={s.label}>End Date</Text>
        <TouchableOpacity style={s.dateInput} onPress={() => setShowEndPicker(true)}>
          <Text style={s.dateText}>{endDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate} mode="date" display="default"
            onChange={(e, date) => { setShowEndPicker(false); if (date) setEndDate(date); }}
          />
        )}

        <Text style={s.label}>Notes (optional)</Text>
        <TextInput style={[s.input, { height: 80 }]} value={notes} onChangeText={setNotes}
          placeholder="Any special requirements..." placeholderTextColor="#64748b"
          multiline textAlignVertical="top" />

        <View style={s.infoBox}>
          <Text style={s.infoText}>ℹ️ Your request will be reviewed by the admin. You'll be notified once approved.</Text>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleBook} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>📋 Submit Booking Request</Text>}
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={alert.onClose} 
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper:   { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20, paddingBottom: 40 },
  roomCard:  { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#00b4d8' },
  roomNum:   { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  roomType:  { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  roomPrice: { fontSize: 16, color: '#00b4d8', fontWeight: '700', marginTop: 6 },
  heading:   { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 20 },
  label:     { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:     { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 16 },
  dateInput: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, marginBottom: 16 },
  dateText:  { color: '#f1f5f9', fontSize: 15 },
  infoBox:   { backgroundColor: '#0c4a6e', borderRadius: 10, padding: 12, marginBottom: 20 },
  infoText:  { color: '#7dd3fc', fontSize: 13, lineHeight: 20 },
  btn:       { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
