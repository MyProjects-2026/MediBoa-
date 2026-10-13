import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
export default function PatientRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleRegister() {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (!cleanName || !cleanEmail || !cleanPhone || !password || !confirmPassword) {
      Alert.alert('Missing information', 'Please complete all fields.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        'Password too short',
        'Your password must contain at least 8 characters.'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please enter matching passwords.');
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Configuration error',
        'The registration service is not configured. Please try again later.'
      );
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            account_type: 'patient',
          },
        },
      });
      if (error) {
        Alert.alert('Registration failed', error.message);
        return;
      }
      if (data.session) {
        Alert.alert(
          'Registration successful',
          'Your account has been created successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/patient-dashboard'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Check your email',
          'Your registration request was received. If email confirmation is enabled, please verify your email before signing in.',
          [
            {
              text: 'Go to login',
              onPress: () => router.replace('/patient-login'),
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Something went wrong',
        'We could not complete your registration. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/patient-login')}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>‹ Back to login</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M+</Text>
            </View>
            <Text style={styles.brandName}>MediBoa+</Text>
            <Text style={styles.brandSubtitle}>Healthcare made accessible</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.description}>
              Register as a patient to get started.
            </Text>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Full name"
            />
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Email address"
            />
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
              accessibilityLabel="Phone number"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Password"
            />
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Confirm password"
              onSubmitEditing={handleRegister}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.showPasswordRow}
              onPress={() => setShowPassword((current) => !current)}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Hide passwords' : 'Show passwords'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create account</Text>
              )}
            </TouchableOpacity>
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/patient-login')}
                disabled={loading}
                accessibilityRole="button"
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.footer}>
            MediBoa+ · Your health matters
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 22,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#123047',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: {
    color: '#123047',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 7,
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#DCE5EA',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#172033',
    marginBottom: 17,
  },
  showPasswordRow: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginTop: -12,
    marginBottom: 12,
  },
  showPasswordText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '600',
  },
  registerButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  loginPrompt: {
    color: '#64748B',
    fontSize: 13,
  },
  loginLink: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 24,
  },
});