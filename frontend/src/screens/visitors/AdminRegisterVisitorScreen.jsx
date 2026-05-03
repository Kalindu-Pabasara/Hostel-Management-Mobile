import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import SearchablePicker from '../../components/SearchablePicker';

export default function AdminRegisterVisitorScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  const [form, setForm] = useState({
    hostStudentId: '',
    visitorName: '',
    visitorPhone: '',
    relationship: '',
    numVisitors: '1',
    visitDate: new Date(),
    visitTime: '10:00',
    visitPurpose: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    api.get('/auth/users').then(res => {
      setStudents(res.data.filter(u => u.role === 'student'));
      setLoadingStudents(false);
    }).catch(e => {
      console.log(e.message);
      setLoadingStudents(false);
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const { hostStudentId, visitorName, visitorPhone, relationship, visitPurpose } = form;
    if (!hostStudentId || !visitorName || !visitorPhone || !relationship || !visitPurpose) {
      setAlert({ visible: true, title: 'Error', message: 'All fields are required.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/visitors', {
        ...form,
        visitDate: form.visitDate.toISOString().split('T')[0]
      });
      setAlert({ 
        visible: true, title: 'Success', 
        message: 'Visitor registered successfully.', 
        type: 'success',
        onClose: () => { setAlert({ ...alert, visible: false }); navigation.goBack(); }
      });
    } catch (err) {
      setAlert({ visible: true, title: 'Error', message: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingStudents) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Select Host Student</Text>
        <TouchableOpacity 
          style={s.pickerTrigger} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={[s.pickerTriggerText, !form.hostStudentId && { color: '#64748b' }]}>
            {form.hostStudentId 
              ? students.find(s => s._id === form.hostStudentId)?.name || 'Select Student'
              : 'Select Host Student...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#00b4d8" />
        </TouchableOpacity>

        <SearchablePicker
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          title="Select Host Student"
          data={students.map(st => ({ label: st.name, sub: `NIC: ${st.nic}`, value: st._id }))}
          onSelect={(item) => set('hostStudentId', item.value)}
        />

        <Text style={s.label}>Visitor Name</Text>
        <TextInput style={s.input} value={form.visitorName} onChangeText={v => set('visitorName', v)} placeholder="Full Name" placeholderTextColor="#64748b" />

        <Text style={s.label}>Visitor Phone</Text>
        <TextInput style={s.input} value={form.visitorPhone} onChangeText={v => set('visitorPhone', v)} placeholder="07XXXXXXXX" placeholderTextColor="#64748b" keyboardType="phone-pad" />

        <Text style={s.label}>Relationship</Text>
        <TextInput style={s.input} value={form.relationship} onChangeText={v => set('relationship', v)} placeholder="e.g. Parent, Friend" placeholderTextColor="#64748b" />

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Visit Date</Text>
            <TouchableOpacity style={s.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={s.dateText}>{form.visitDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.label}>Visit Time</Text>
            <TextInput style={s.input} value={form.visitTime} onChangeText={v => set('visitTime', v)} placeholder="10:00" placeholderTextColor="#64748b" />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker value={form.visitDate} mode="date" onChange={(e, d) => { setShowDatePicker(false); if(d) set('visitDate', d); }} />
        )}

        <Text style={s.label}>Purpose of Visit</Text>
        <TextInput style={[s.input, { height: 80 }]} value={form.visitPurpose} onChangeText={v => set('visitPurpose', v)} placeholder="Reason for visiting..." placeholderTextColor="#64748b" multiline textAlignVertical="top" />

        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Register Visitor</Text>}
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={alert.onClose || (() => setAlert({ ...alert, visible: false }))} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper:   { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20, paddingBottom: 40 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  label:     { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input:     { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 4 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, marginBottom: 4 },
  pickerTriggerText: { color: '#f1f5f9', fontSize: 15 },
  row:       { flexDirection: 'row', marginTop: 8 },
  dateBtn:   { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14 },
  dateText:  { color: '#f1f5f9', fontSize: 15 },
  submitBtn: { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
