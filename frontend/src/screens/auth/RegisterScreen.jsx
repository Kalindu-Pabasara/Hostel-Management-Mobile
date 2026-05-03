import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

const ADMIN_SECRET = 'ADMIN2026';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm]       = useState({ name:'', email:'', nic:'', phone:'', adminCode:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert]     = useState({ visible: false, title: '', message: '', type: 'error', onClose: () => {} });
  
  // Auto-generate password on mount
  useEffect(() => {
    const generatedPassword = Math.random().toString(36).slice(-8);
    setForm(f => ({ ...f, password: generatedPassword }));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const showAlert = (title, message, type = 'error', onClose = () => setAlert(prev => ({ ...prev, visible: false }))) => {
    setAlert({ visible: true, title, message, type, onClose });
  };

  const handleRegister = async () => {
    const { name, email, nic, phone, adminCode, password } = form;
    if (!name || !email || !nic || !phone || !password) 
      return showAlert('Error', 'All fields are required.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return showAlert('Validation Error', 'Invalid email format.');

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(nic.trim()))
      return showAlert('Validation Error', 'Invalid NIC format.');

    const phoneRegex = /^(0|\+94)[0-9]{9}$/;
    if (!phoneRegex.test(phone.trim()))
      return showAlert('Validation Error', 'Invalid Phone number format. Must be 10 digits.');

    const role = adminCode.trim() === ADMIN_SECRET ? 'admin' : 'student';
    if (adminCode.trim() && adminCode.trim() !== ADMIN_SECRET)
      return showAlert('Invalid Code', 'Admin code is incorrect.');

    setLoading(true);
    try {
      await register({ name, email: email.trim().toLowerCase(), nic: nic.trim(), phone: phone.trim(), password, role });
      
      showAlert('Account Created 🎉', `Your password is:\n\n${password}\n\nPlease copy it and login.`, 'success', () => {
        setAlert(prev => ({ ...prev, visible: false }));
        navigation.navigate('Login');
      });

    } catch (err) {
      showAlert('Registration Failed', err.response?.data?.message || 'Server error.');
    } finally { setLoading(false); }
  };

  const fields = [
    { label:'Full Name',     key:'name',   placeholder:'John Silva',      kb:'default' },
    { label:'Email Address', key:'email',  placeholder:'john@email.com',  kb:'email-address' },
    { label:'NIC Number',    key:'nic',    placeholder:'200012345678',    kb:'default' },
    { label:'Phone Number',  key:'phone',  placeholder:'0771234567',      kb:'phone-pad' },
  ];

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Create Account</Text>
        <Text style={s.sub}>Join HostelMS today</Text>

        <View style={s.card}>
          {fields.map(f => (
            <View key={f.key}>
              <Text style={s.label}>{f.label}</Text>
              <TextInput
                style={s.input} value={form[f.key]} onChangeText={v => set(f.key, v)}
                placeholder={f.placeholder} placeholderTextColor="#64748b"
                keyboardType={f.kb} autoCapitalize="none"
              />
            </View>
          ))}

          <Text style={s.label}>Password (Auto-generated)</Text>
          <View style={s.pwdRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]} value={form.password} onChangeText={v => set('password', v)}
              placeholder="Password" placeholderTextColor="#64748b"
              autoCapitalize="none" secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Text style={s.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>Admin Code <Text style={{ color:'#64748b', fontWeight:'400' }}>(optional — leave blank for student)</Text></Text>
          <TextInput
            style={s.input} value={form.adminCode} onChangeText={v => set('adminCode', v)}
            placeholder="Enter admin code to register as admin"
            placeholderTextColor="#64748b" autoCapitalize="none" secureTextEntry={true}
          />

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={s.linkText}>Already have an account? <Text style={{ color: '#00b4d8' }}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
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
  container: { padding: 24, paddingTop: 60 },
  title:     { fontSize: 26, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  sub:       { fontSize: 14, color: '#64748b', marginBottom: 24 },
  card:      { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155' },
  label:     { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:     { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 14 },
  pwdRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, marginBottom: 14 },
  eyeBtn:    { padding: 14 },
  eyeText:   { color: '#00b4d8', fontWeight: '600', fontSize: 13 },
  btn:       { backgroundColor: '#00b4d8', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn:   { marginTop: 20, alignItems: 'center' },
  linkText:  { color: '#64748b', fontSize: 14 },
});
