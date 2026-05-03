import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState({ visible: false, title: '', message: '', type: 'error' });

  const handleLogin = async () => {
    if (!email || !password) return setAlert({ visible: true, title: 'Error', message: 'Please enter email and password.', type: 'error' });
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setAlert({ visible: true, title: 'Login Failed', message: err.response?.data?.message || 'Cannot connect to server. Check your WiFi.', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoBox}>
          <Text style={s.logoEmoji}>🏨</Text>
          <Text style={s.logoTitle}>HostelMS</Text>
          <Text style={s.logoSub}>Hostel Management System</Text>
        </View>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.sub}>Sign in to continue</Text>

          <Text style={s.label}>Email Address</Text>
          <TextInput
            style={s.input} value={email} onChangeText={setEmail}
            placeholder="admin@hostelms.lk" placeholderTextColor="#64748b"
            keyboardType="email-address" autoCapitalize="none"
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input} value={password} onChangeText={setPassword}
            placeholder="••••••••" placeholderTextColor="#64748b"
            secureTextEntry
          />

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.linkText}>Don't have an account? <Text style={{ color: '#00b4d8' }}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={() => setAlert(p => ({ ...p, visible: false }))} 
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper:    { flex: 1, backgroundColor: '#0f172a' },
  container:  { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBox:    { alignItems: 'center', marginBottom: 36 },
  logoEmoji:  { fontSize: 60, marginBottom: 8 },
  logoTitle:  { fontSize: 30, fontWeight: '800', color: '#f1f5f9', letterSpacing: 1 },
  logoSub:    { fontSize: 13, color: '#64748b', marginTop: 4 },
  card:       { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155' },
  title:      { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  sub:        { fontSize: 14, color: '#64748b', marginBottom: 24 },
  label:      { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:      { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 16 },
  btn:        { backgroundColor: '#00b4d8', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn:    { marginTop: 20, alignItems: 'center' },
  linkText:   { color: '#64748b', fontSize: 14 },
});
