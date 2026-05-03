import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAdmin } = useAuth();
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {}, onConfirm: null, showCancel: false });

  const handleLogout = () => {
    setAlert({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        setAlert(prev => ({ ...prev, visible: false }));
        logout();
      },
      onClose: () => setAlert(prev => ({ ...prev, visible: false }))
    });
  };

  const menuItems = isAdmin()
    ? [{ icon:'🔧', label:'Maintenance Requests', tab:'Operations', screen:'AdminMaintenance' }]
    : [
        { icon:'🔧', label:'My Maintenance Requests', tab:'Operations', screen:'MyMaintenance' },
        { icon:'➕', label:'Report an Issue',          tab:'Operations', screen:'MaintenanceForm' },
      ];

  return (
    <ScrollView style={s.container}>
      {/* Profile header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={[s.roleBadge, { backgroundColor: isAdmin() ? '#f59e0b22' : '#00b4d822', borderColor: isAdmin() ? '#f59e0b' : '#00b4d8' }]}>
          <Text style={[s.roleText, { color: isAdmin() ? '#f59e0b' : '#00b4d8' }]}>
            {isAdmin() ? '👑 Admin' : '🎓 Student'}
          </Text>
        </View>

        <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('UpdateProfile')}>
          <Ionicons name="pencil" size={14} color="#00b4d8" />
          <Text style={s.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info cards */}
      <View style={s.card}>
        {[
          { label: 'Name',  value: user?.name },
          { label: 'Email', value: user?.email },
          { label: 'NIC',   value: user?.nic   || '—' },
          { label: 'Phone', value: user?.phone  || '—' },
          { label: 'Role',  value: user?.role   || '—' },
        ].map(({ label, value }) => (
          <View key={label} style={s.infoRow}>
            <Text style={s.infoLabel}>{label}</Text>
            <Text style={s.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Menu items */}
      {menuItems.map(item => (
        <TouchableOpacity key={item.label} style={s.menuItem} onPress={() => navigation.navigate(item.tab, { screen: item.screen })}>
          <Text style={s.menuIcon}>{item.icon}</Text>
          <Text style={s.menuLabel}>{item.label}</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout button */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <Text style={s.footer}>HostelMS v1.0 · SE2020 WMT Project</Text>
      
      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onClose={alert.onClose} 
        confirmText="LOGOUT"
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0f172a' },
  header:     { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  avatar:     { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00b4d8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name:       { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  email:      { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  roleBadge:  { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  roleText:   { fontSize: 13, fontWeight: '700' },
  editBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00b4d811', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#00b4d8' },
  editBtnText: { color: '#00b4d8', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  card:       { backgroundColor: '#1e293b', borderRadius: 14, margin: 16, padding: 4, borderWidth: 1, borderColor: '#334155' },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  infoLabel:  { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  infoValue:  { fontSize: 14, color: '#f1f5f9' },
  menuItem:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  menuIcon:   { fontSize: 20, marginRight: 12 },
  menuLabel:  { flex: 1, fontSize: 15, color: '#f1f5f9', fontWeight: '500' },
  menuArrow:  { fontSize: 20, color: '#94a3b8' },
  logoutBtn:  { backgroundColor: '#ef444422', borderRadius: 12, margin: 16, marginTop: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
  footer:     { textAlign: 'center', color: '#334155', fontSize: 12, marginBottom: 32 },
});
