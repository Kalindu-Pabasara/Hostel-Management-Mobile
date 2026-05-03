import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function VisitorRegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    visitorName:'', visitorNic:'', visitorPhone:'',
    relationship:'', visitPurpose:'', numVisitors:'1',
    visitDate: new Date().toISOString().split('T')[0], visitTime:'',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const handleSubmit = async () => {
    const { visitorName, visitorNic, visitorPhone, relationship, visitPurpose, visitDate, visitTime } = form;
    if (!visitorName || !visitorNic || !visitorPhone || !relationship || !visitPurpose || !visitDate || !visitTime)
      return showAlert('Error', 'All fields are required.');

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(visitorNic.trim()))
      return showAlert('Validation Error', 'Invalid NIC format.');

    const phoneRegex = /^(0|\+94)[0-9]{9}$/;
    if (!phoneRegex.test(visitorPhone.trim()))
      return showAlert('Validation Error', 'Invalid Phone number format. Must be 10 digits.');

    setLoading(true);
    try {
      await api.post('/visitors', { ...form, numVisitors: Number(form.numVisitors) || 1 });
      showAlert('✅ Submitted', 'Visitor registered. Waiting for admin approval.', 'success', () => {
        setAlert(prev => ({ ...prev, visible: false }));
        navigation.goBack();
      });
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const relationships = ['Parent','Sibling','Friend','Relative','Other'];

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.policyCard}>
          <Text style={s.policyTitle}>🔒 Visitor Policy</Text>
          <Text style={s.policyText}>• Visiting Hours: 08:00 AM - 08:00 PM</Text>
          <Text style={s.policyText}>• Maximum 5 approved visitors per day in the hostel</Text>
          <Text style={s.policyText}>• Overnight stays are not permitted</Text>
          <Text style={s.policyText}>• ID verification required at security</Text>
        </View>

        {[
          { label:'Visitor Name',  key:'visitorName',  placeholder:'Saman Perera',  kb:'default' },
          { label:'Visitor NIC',   key:'visitorNic',   placeholder:'200012345678',   kb:'default' },
          { label:'Visitor Phone', key:'visitorPhone', placeholder:'+94 71 234 5678',kb:'phone-pad' },
          { label:'Visit Purpose', key:'visitPurpose', placeholder:'Family visit',   kb:'default' },
          { label:'Visit Time (e.g. 14:00)', key:'visitTime', placeholder:'14:00',   kb:'default' },
          { label:'Number of Visitors', key:'numVisitors', placeholder:'1',          kb:'numeric' },
        ].map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} value={form[f.key]} onChangeText={v => set(f.key, v)}
              placeholder={f.placeholder} placeholderTextColor="#64748b" keyboardType={f.kb} />
          </View>
        ))}

        <Text style={s.label}>Visit Date</Text>
        <TouchableOpacity style={s.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text style={s.dateText}>{form.visitDate}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.visitDate)} mode="date" display="default"
            onChange={(e, date) => { setShowDatePicker(false); if (date) set('visitDate', date.toISOString().split('T')[0]); }}
          />
        )}

        <Text style={s.label}>Relationship</Text>
        <View style={s.chips}>
          {relationships.map(r => (
            <TouchableOpacity key={r} style={[s.chip, form.relationship===r && s.chipActive]} onPress={() => set('relationship',r)}>
              <Text style={[s.chipText, form.relationship===r && { color:'#fff' }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity:0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>👥 Register Visitor</Text>}
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
  policyCard:{ backgroundColor: '#0f2942', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#00b4d8' },
  policyTitle:{ fontSize: 16, fontWeight: 'bold', color: '#00b4d8', marginBottom: 8 },
  policyText:{ fontSize: 13, color: '#cbd5e1', lineHeight: 20, marginBottom: 2 },
  label:     { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:     { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 16 },
  dateInput: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, marginBottom: 16 },
  dateText:  { color: '#f1f5f9', fontSize: 15 },
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive:{ backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  chipText:  { color: '#94a3b8', fontSize: 13 },
  btn:       { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
