import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

const statusColors = { pending:'#f59e0b', paid:'#22c55e', delete_requested:'#ef4444' };

export default function PaymentHistoryScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {}, onConfirm: null, showCancel: false });

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false })), onConfirm = null, showCancel = false) => {
    setAlert({ visible: true, title, message, type, onClose, onConfirm, showCancel });
  };

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get('/fees/payments');
      setPayments(res.data);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchPayments(); }, []));

  const approve = async (id) => {
    try { await api.patch(`/fees/payments/${id}/approve`); fetchPayments(); }
    catch (e) { showAlert('Error', e.response?.data?.message || e.message); }
  };

  const deletePayment = (id) => {
    showAlert('Delete Request', 'Request deletion of this payment record? The student will need to approve this action.', 'error', 
      () => setAlert(prev => ({ ...prev, visible: false })),
      async () => {
        try { 
          setAlert(prev => ({ ...prev, visible: false }));
          await api.delete(`/fees/payments/${id}`); 
          fetchPayments(); 
        } catch (e) { showAlert('Error', e.response?.data?.message || e.message); }
      },
      true
    );
  };

  const respondDelete = async (id, action) => {
    try {
      await api.patch(`/fees/payments/${id}/delete_${action}`);
      fetchPayments();
    } catch (e) { showAlert('Error', e.response?.data?.message || e.message); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <View style={s.topRow}>
        <TouchableOpacity style={s.viewStructBtn} onPress={() => navigation.navigate('FeeStructure')}>
          <Text style={s.viewStructText}>ℹ️ View Fee Structure</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('FeePayment')}>
          <Text style={s.addBtnText}>＋ Record Payment</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={payments} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} tintColor="#00b4d8" />}
        renderItem={({ item: p }) => {
          const c = statusColors[p.status] || '#94a3b8';
          const isStudent = !isAdmin();
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.feeType}>{p.feeType}</Text>
                <View style={[s.badge, { backgroundColor: c+'22', borderColor: c }]}>
                  <Text style={[s.badgeText, { color: c }]}>{p.status.replace('_', ' ')}</Text>
                </View>
              </View>
              {p.studentId?.name && <Text style={s.student}>👤 {p.studentId.name}</Text>}
              <Text style={s.amount}>LKR {p.amount?.toLocaleString()}</Text>
              <Text style={s.detail}>{p.paymentMethod.replace('_', ' ')} · {new Date(p.paymentDate).toLocaleDateString()}</Text>
              {p.billingMonth && <Text style={s.detail}>Month: {p.billingMonth}</Text>}
              {p.referenceNo  && <Text style={s.detail}>Ref: {p.referenceNo}</Text>}
              {p.paymentProof && (
                <TouchableOpacity onPress={() => Linking.openURL(`${api.defaults.baseURL.replace('/api', '')}/uploads/${p.paymentProof}`)}>
                  <Text style={s.proofLink}>📄 View Payment Proof</Text>
                </TouchableOpacity>
              )}
              
              {/* Delete Request Banner for Student */}
              {p.status === 'delete_requested' && isStudent && (
                <View style={s.delBanner}>
                  <Text style={s.delBannerText}>⚠️ Admin requested to delete this record.</Text>
                  <View style={s.delBannerActions}>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => respondDelete(p._id, 'reject')}>
                      <Text style={s.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.confirmBtn} onPress={() => respondDelete(p._id, 'approve')}>
                      <Text style={s.confirmText}>Approve Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
 
              {/* Actions for Admin */}
              {isAdmin() && p.status !== 'delete_requested' && (
                <View style={s.actions}>
                  {p.status === 'pending' && (
                    <TouchableOpacity style={s.approveBtn} onPress={() => approve(p._id)}>
                      <Text style={s.approveText}>✅ Approve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.delBtn} onPress={() => deletePayment(p._id)}>
                    <Text style={s.delText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No payments recorded yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={alert.onClose} 
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
        confirmText={alert.showCancel ? "YES" : "OK"}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  topRow:      { flexDirection: 'row', gap: 10, marginBottom: 12 },
  viewStructBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  viewStructText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  addBtn:      { flex: 1, backgroundColor: '#00b4d8', borderRadius: 10, padding: 14, alignItems: 'center' },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  card:        { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  feeType:     { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:   { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  student:     { color: '#00b4d8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  amount:      { fontSize: 20, fontWeight: '800', color: '#22c55e', marginBottom: 6 },
  detail:      { color: '#94a3b8', fontSize: 13, marginBottom: 2 },
  proofLink:   { color: '#3b82f6', fontSize: 13, fontWeight: '600', marginTop: 6, textDecorationLine: 'underline' },
  actions:     { flexDirection: 'row', gap: 10, marginTop: 12 },
  approveBtn:  { flex: 1, backgroundColor: '#22c55e22', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#22c55e' },
  approveText: { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  delBtn:      { flex: 1, backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  delText:     { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty:       { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
  delBanner:   { marginTop: 12, backgroundColor: '#450a0a', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444' },
  delBannerText:{ color: '#fca5a5', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  delBannerActions: { flexDirection: 'row', gap: 10 },
  rejectBtn:   { flex: 1, backgroundColor: '#1e293b', borderRadius: 6, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  rejectText:  { color: '#fca5a5', fontWeight: '600', fontSize: 13 },
  confirmBtn:  { flex: 1, backgroundColor: '#ef4444', borderRadius: 6, padding: 10, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
