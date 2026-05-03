import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';

const statusColors = { pending:'#f59e0b', approved:'#22c55e', rejected:'#ef4444' };

export default function AdminVisitorScreen({ navigation }) {
  const [visitors, setVisitors]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const fetchVisitors = useCallback(async () => {
    try { const res = await api.get('/visitors'); setVisitors(res.data); }
    catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchVisitors(); }, []));

  const action = async (id, type) => {
    try { await api.patch(`/visitors/${id}/${type}`); fetchVisitors(); }
    catch (e) { 
      const msg = e.response?.data?.message || e.message;
      const title = msg.includes('Maximum 5') ? 'Limit Reached ⚠️' : 'Error';
      showAlert(title, msg); 
    }
  };

  const deleteVisitor = (id) => {
    showAlert('Delete', 'Delete this visitor record?', 'error', async () => {
      try { 
        await api.delete(`/visitors/${id}`); 
        fetchVisitors(); 
      } catch (e) { 
        showAlert('Error', e.message); 
      }
      setAlert(prev => ({ ...prev, visible: false }));
    });
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#00b4d8" size="large" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AdminRegisterVisitor')}>
        <Text style={s.addBtnText}>＋ Register New Visitor</Text>
      </TouchableOpacity>
      <FlatList data={visitors} keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisitors(); }} tintColor="#00b4d8" />}
        renderItem={({ item: v }) => {
          const c = statusColors[v.status] || '#94a3b8';
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.name}>{v.visitorName}</Text>
                <View style={[s.badge, { backgroundColor: c+'22', borderColor: c }]}>
                  <Text style={[s.badgeText, { color: c }]}>{v.status}</Text>
                </View>
              </View>
              <Text style={s.host}>👤 Host: {v.hostStudentId?.name || '—'}</Text>
              <Text style={s.detail}>📞 {v.visitorPhone} · {v.relationship}</Text>
              <Text style={s.detail}>📅 {new Date(v.visitDate).toLocaleDateString()} at {v.visitTime}</Text>
              <Text style={s.detail}>👥 {v.numVisitors} visitor(s) · {v.visitPurpose}</Text>
              {v.status === 'pending' && (
                <View style={s.actions}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => action(v._id,'approve')}>
                    <Text style={s.approveText}>✅ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => action(v._id,'reject')}>
                    <Text style={s.rejectText}>❌ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={s.delBtn} onPress={() => deleteVisitor(v._id)}>
                <Text style={s.delText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No visitor registrations.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      
      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={alert.onClose} 
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a', padding: 12 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  addBtn:      { backgroundColor: '#00b4d8', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  card:        { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name:        { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:   { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  host:        { color: '#00b4d8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  detail:      { color: '#94a3b8', fontSize: 13, marginBottom: 3 },
  actions:     { flexDirection: 'row', gap: 10, marginTop: 10 },
  approveBtn:  { flex: 1, backgroundColor: '#22c55e22', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#22c55e' },
  approveText: { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  rejectBtn:   { flex: 1, backgroundColor: '#ef444422', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  rejectText:  { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  delBtn:      { marginTop: 8, backgroundColor: '#1e293b', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  delText:     { color: '#64748b', fontWeight: '600', fontSize: 13 },
  empty:       { textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 15 },
});
