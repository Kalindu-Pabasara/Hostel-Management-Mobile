import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FeePaymentScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const [feeTypes, setFeeTypes]   = useState([]);
  const [form, setForm] = useState({
    feeType:'', amount:'', paymentMethod:'cash',
    paymentDate: new Date(),
    billingMonth:'', referenceNo:'', notes:'',
  });
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  useEffect(() => {
    api.get('/fees/structure').then(r => setFeeTypes(r.data)).catch(() => {});
  }, []);

  const methods = ['cash','bank_transfer','online','cheque'];
  const methodLabels = { cash: 'Cash', bank_transfer: 'Bank Deposit', online: 'Online Transfer', cheque: 'Cheque' };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleSubmit = async () => {
    const { feeType, amount, paymentMethod, paymentDate } = form;
    if (!feeType || !amount || !paymentMethod || !paymentDate)
      return showAlert('Error', 'Fee type, amount, method and date are required.');
    
    if ((paymentMethod === 'bank_transfer' || paymentMethod === 'online') && !proofFile && !isAdmin()) {
      return showAlert('Error', 'Please upload a proof of payment.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'paymentDate') {
          formData.append(k, form[k].toISOString().split('T')[0]);
        } else if (form[k]) {
          formData.append(k, form[k]);
        }
      });

      if (proofFile) {
        formData.append('paymentProof', {
          uri: proofFile.uri,
          name: proofFile.name || 'proof.jpg',
          type: proofFile.mimeType || 'image/jpeg'
        });
      }

      await api.post('/fees/payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showAlert('✅ Success', isAdmin() ? 'Payment recorded.' : 'Payment submitted for approval.', 'success', () => {
        setAlert(prev => ({ ...prev, visible: false }));
        navigation.goBack();
      });
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <Text style={s.label}>Fee Type</Text>
        <View style={s.optRow}>
          {feeTypes.map(f => (
            <TouchableOpacity key={f.id} style={[s.optBtn, form.feeType===f.name && s.optActive]}
              onPress={() => setForm(prev => ({ ...prev, feeType: f.name, amount: f.amount.toString() }))}>
              <Text style={[s.optText, form.feeType===f.name && { color:'#fff' }]}>{f.name}</Text>
              <Text style={[s.optPrice, form.feeType===f.name && { color:'#bae6fd' }]}>LKR {f.amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Amount (LKR)</Text>
        <TextInput style={s.input} value={form.amount} onChangeText={v => set('amount',v)}
          placeholder="15000" placeholderTextColor="#64748b" keyboardType="numeric" />

        <Text style={s.label}>Payment Method</Text>
        <View style={s.optRow}>
          {methods.map(m => (
            <TouchableOpacity key={m} style={[s.optBtn, form.paymentMethod===m && s.optActive]} onPress={() => set('paymentMethod',m)}>
              <Text style={[s.optText, form.paymentMethod===m && { color:'#fff' }]}>{methodLabels[m]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Payment Date</Text>
        <TouchableOpacity style={s.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text style={s.dateText}>{form.paymentDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.paymentDate} mode="date" display="default"
            onChange={(e, date) => { setShowDatePicker(false); if (date) set('paymentDate', date); }}
          />
        )}
        <Text style={s.label}>Billing Month</Text>
        <TextInput style={s.input} value={form.billingMonth} onChangeText={v => set('billingMonth',v)}
          placeholder="May 2026" placeholderTextColor="#64748b" />

        {(form.paymentMethod === 'bank_transfer' || form.paymentMethod === 'online') && (
          <>
            <Text style={s.label}>Reference Number</Text>
            <TextInput style={s.input} value={form.referenceNo} onChangeText={v => set('referenceNo',v)}
              placeholder="TXN123456" placeholderTextColor="#64748b" />
            
            <Text style={s.label}>Proof of Payment (Required)</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={pickDocument}>
              <Text style={s.uploadBtnText}>
                {proofFile ? `📄 ${proofFile.name}` : '📎 Select Image or PDF'}
              </Text>
            </TouchableOpacity>
            {proofFile && (
              <TouchableOpacity onPress={() => setProofFile(null)}>
                <Text style={s.removeFileText}>Remove File</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <Text style={s.label}>Notes (optional)</Text>
        <TextInput style={[s.input, { height:70 }]} value={form.notes} onChangeText={v => set('notes',v)}
          placeholder="Any additional info..." placeholderTextColor="#64748b" multiline textAlignVertical="top" />

        <TouchableOpacity style={[s.btn, loading && { opacity:0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>💳 Submit Payment</Text>}
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
  dateInput: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, marginBottom: 16 },
  dateText:  { color: '#f1f5f9', fontSize: 15 },
  optRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  optActive: { backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  optText:   { color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' },
  optPrice:  { color: '#64748b', fontSize: 11, marginTop: 2 },
  uploadBtn: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#3b82f6', borderStyle: 'dashed', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 8 },
  uploadBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  removeFileText: { color: '#ef4444', fontSize: 13, textAlign: 'right', marginBottom: 16 },
  btn:       { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
