import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';
import SearchablePicker from '../../components/SearchablePicker';

export default function AdminRoomAllocateScreen({ navigation }) {
  const [students, setStudents]   = useState([]);
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom]       = useState(null);
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate]     = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker]     = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'error' });
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker]       = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStud, resRooms] = await Promise.all([
        api.get('/auth/available-students'),
        api.get('/rooms')
      ]);
      setStudents(resStud.data);
      // Only show available rooms
      setRooms(resRooms.data.filter(r => r.currentOccupancy < r.capacity && r.status !== 'maintenance'));
    } catch (e) {
      console.log('Error fetching data:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleAllocate = async () => {
    if (!selectedStudent || !selectedRoom) {
      setAlert({ visible: true, title: 'Error', message: 'Please select both a student and a room.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings/direct', {
        studentId: selectedStudent._id,
        roomId: selectedRoom._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      setAlert({ 
        visible: true, title: 'Success 🎉', 
        message: `Successfully allocated Room ${selectedRoom.roomNumber} to ${selectedStudent.name}.`, 
        type: 'success' 
      });
      
      // Reset selections
      setSelectedStudent(null);
      setSelectedRoom(null);
      fetchData();
    } catch (e) {
      setAlert({ visible: true, title: 'Error', message: e.response?.data?.message || e.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.sectionTitle}>1. Select Student</Text>
      <TouchableOpacity style={s.pickerTrigger} onPress={() => setShowStudentPicker(true)}>
        <Text style={[s.pickerTriggerText, !selectedStudent && { color: '#64748b' }]}>
          {selectedStudent ? selectedStudent.name : 'Select Student...'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#00b4d8" />
      </TouchableOpacity>

      <Text style={s.sectionTitle}>2. Select Room</Text>
      <TouchableOpacity style={s.pickerTrigger} onPress={() => setShowRoomPicker(true)}>
        <Text style={[s.pickerTriggerText, !selectedRoom && { color: '#64748b' }]}>
          {selectedRoom ? `Room ${selectedRoom.roomNumber} (${selectedRoom.type})` : 'Select Room...'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#00b4d8" />
      </TouchableOpacity>

      <SearchablePicker
        visible={showStudentPicker}
        onClose={() => setShowStudentPicker(false)}
        title="Select Student"
        data={students.map(st => ({ label: st.name, sub: `NIC: ${st.nic} · ${st.email}`, value: st._id, original: st }))}
        onSelect={(item) => setSelectedStudent(item.original)}
      />

      <SearchablePicker
        visible={showRoomPicker}
        onClose={() => setShowRoomPicker(false)}
        title="Select Room"
        data={rooms.map(rm => ({ label: `Room ${rm.roomNumber} (${rm.type})`, sub: `Floor ${rm.floor} · ${rm.capacity - rm.currentOccupancy} beds free`, value: rm._id, original: rm }))}
        onSelect={(item) => setSelectedRoom(item.original)}
      />

      <Text style={s.sectionTitle}>3. Allocation Period</Text>
      <View style={s.dateRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.dateLabel}>Start Date</Text>
          <TouchableOpacity style={s.dateBtn} onPress={() => setShowStartPicker(true)}>
            <Text style={s.dateText}>{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.dateLabel}>End Date</Text>
          <TouchableOpacity style={s.dateBtn} onPress={() => setShowEndPicker(true)}>
            <Text style={s.dateText}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker value={startDate} mode="date" onChange={(e, d) => { setShowStartPicker(false); if(d) setStartDate(d); }} />
      )}
      {showEndPicker && (
        <DateTimePicker value={endDate} mode="date" onChange={(e, d) => { setShowEndPicker(false); if(d) setEndDate(d); }} />
      )}

      <TouchableOpacity 
        style={[s.submitBtn, submitting && { opacity: 0.7 }]} 
        onPress={handleAllocate}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>✅ Confirm Allocation</Text>}
      </TouchableOpacity>

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ ...alert, visible: false })} 
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#00b4d8', marginTop: 24, marginBottom: 12 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, marginBottom: 4 },
  pickerTriggerText: { color: '#f1f5f9', fontSize: 15 },
  dateRow:   { flexDirection: 'row', marginTop: 24, marginBottom: 24 },
  dateLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  dateBtn:   { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, alignItems: 'center' },
  dateText:  { color: '#f1f5f9', fontSize: 15 },
  submitBtn: { backgroundColor: '#10b981', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 12 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
