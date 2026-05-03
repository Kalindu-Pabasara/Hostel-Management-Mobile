import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';

export default function FeeStructureScreen() {
  const [loadingId, setLoadingId] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const requestService = async (category) => {
    setLoadingId(category);
    try {
      await api.post('/maintenance', {
        category,
        roomNumber: 'N/A', // Service request doesn't strictly need a room if not allocated
        description: `Requested ${category === 'meals' ? 'Mess/Meals' : 'Laundry'} Service via Fee Structure.`,
        priority: 'medium'
      });
      showAlert('✅ Success', `Your request for ${category} has been sent to the administration.`, 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const fees = [
    { id:1, name:'Accommodation - Single', category:'accommodation', amount:15000 },
    { id:2, name:'Accommodation - Double', category:'accommodation', amount:22000 },
    { id:3, name:'Accommodation - Suite',  category:'accommodation', amount:35000 },
    { id:4, name:'Mess Fee',               category:'meals',         amount:8000, canRequest: true },
    { id:5, name:'Electricity & Water',    category:'utilities',     amount:2500  },
    { id:6, name:'Laundry Service',        category:'laundry',       amount:1500, canRequest: true },
    { id:7, name:'Security Deposit',       category:'security',      amount:30000 },
  ];

  return (
    <ScrollView style={s.wrapper}>
      <View style={s.container}>
        <Text style={s.heading}>Hostel Fee Structure</Text>
        <Text style={s.subtitle}>Review the monthly charges and deposits.</Text>

        <View style={s.card}>
          {fees.map((f, i) => (
            <View key={f.id} style={[s.row, i === fees.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.feeName}>{f.name}</Text>
                <Text style={s.feeCat}>{f.category.toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.feeAmount}>LKR {f.amount.toLocaleString()}</Text>
                {f.canRequest && (
                  <TouchableOpacity style={s.reqBtn} onPress={() => requestService(f.category)} disabled={loadingId === f.category}>
                    {loadingId === f.category ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.reqBtnText}>Request</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>⚠️ Note: Security Deposit is a one-time refundable payment. All other charges are applied on a monthly basis.</Text>
        </View>
      </View>

      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={alert.onClose} 
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  feeName: { fontSize: 15, fontWeight: '600', color: '#f8fafc', marginBottom: 2 },
  feeCat: { fontSize: 11, color: '#00b4d8', fontWeight: 'bold' },
  feeAmount: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  reqBtn:    { backgroundColor: '#00b4d8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 6 },
  reqBtnText:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  infoBox: { backgroundColor: '#f59e0b20', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#f59e0b' },
  infoText: { color: '#fbbf24', fontSize: 13, lineHeight: 20 }
});
