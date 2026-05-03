import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';

export default function MaintenanceFormScreen({ navigation }) {
  const [form, setForm] = useState({ roomNumber:'', category:'electrical', description:'', priority:'medium' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });
  
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const categories = ['electrical', 'plumbing', 'carpentry', 'cleaning', 'ac', 'wifi', 'furniture', 'other'];
  const priorities = ['low','medium','high','urgent'];

  const handleSubmit = async () => {
    if (!form.roomNumber || !form.description)
      return showAlert('Error', 'Room number and description are required.');
    setLoading(true);
    try {
      await api.post('/maintenance', form);
      showAlert('✅ Submitted', 'Maintenance request sent to admin.', 'success', () => {
        setAlert(prev => ({ ...prev, visible: false }));
        navigation.goBack();
      });
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const priorityColors = { low:'#22c55e', medium:'#f59e0b', high:'#ef4444', urgent:'#dc2626' };

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Room Number</Text>
        <TextInput style={s.input} value={form.roomNumber} onChangeText={v => set('roomNumber',v)}
          placeholder="A101" placeholderTextColor="#64748b" />

        <Text style={s.label}>Category</Text>
        <View style={s.chips}>
          {categories.map(c => (
            <TouchableOpacity key={c} style={[s.chip, form.category===c && s.chipActive]} onPress={() => set('category',c)}>
              <Text style={[s.chipText, form.category===c && { color:'#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Priority</Text>
        <View style={s.chips}>
          {priorities.map(p => {
            const col = priorityColors[p];
            const active = form.priority === p;
            return (
              <TouchableOpacity key={p} style={[s.chip, active && { backgroundColor: col, borderColor: col }]} onPress={() => set('priority',p)}>
                <Text style={[s.chipText, active && { color:'#fff' }]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.label}>Description</Text>
        <TextInput style={[s.input, { height: 100 }]} value={form.description} onChangeText={v => set('description',v)}
          placeholder="Describe the issue in detail..." placeholderTextColor="#64748b"
          multiline textAlignVertical="top" />

        <TouchableOpacity style={[s.btn, loading && { opacity:0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>🔧 Submit Request</Text>}
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
  label:     { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:     { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 16 },
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive:{ backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  chipText:  { color: '#94a3b8', fontSize: 13, textTransform: 'capitalize' },
  btn:       { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
