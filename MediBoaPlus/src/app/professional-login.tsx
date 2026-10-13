import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/mediboa-auth';

export default function ProfessionalLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        'Missing information',
        'Enter your professional email and password.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Configuration error',
        'Supabase is not configured correctly.'
      );
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user || !data.session) {
        Alert.alert(
          'Sign-in failed',
          'The credentials could not be verified. Check your details and try again.'
        );
        return;
      }

      const profile = await getCurrentProfile();

      if (!profile) {
        await supabase.auth.signOut();
        Alert.alert(
          'Profile unavailable',
          'Your account profile could not be verified. Contact the administrator.'
        );
        return;
      }

      if (profile.account_status !== 'active') {
        await supabase.auth.signOut();
        Alert.alert(
          'Account not active',
          'This account is not authorized to access the professional workspace.'
        );
        return;
      }

      if (profile.role !== 'professional') {
        await supabase.auth.signOut();
        Alert.alert(
          'Access denied',
          'This login is reserved for authorized healthcare professionals.'
        );
        return;
      }

      Alert.alert(
        'Welcome',
        'Your professional identity has been verified.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/professional-dashboard'),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Connection error',
        'Unable to contact the authentication service. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.back}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backText}>← Back to home</Text>
          </Pressable>

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M+</Text>
            </View>
            <Text style={styles.brandName}>MediBoa+</Text>
            <Text style={styles.subtitle}>Professional workspace</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Professional sign-in</Text>
            <Text style={styles.description}>
              Sign in with the credentials issued for your authorized account.
            </Text>

            <Text style={styles.label}>Professional email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Professional email"
              placeholderTextColor="#80919F"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#80919F"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                editable={!loading}
              />
              <Pressable
                style={styles.showButton}
                onPress={() => setShowPassword(value => !value)}
                accessibilityRole="button"
              >
                <Text style={styles.showText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign in securely</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.forgot}
              onPress={async () => {
                const cleanEmail = email.trim().toLowerCase();

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                  Alert.alert(
                    'Email required',
                    'Enter your professional email address first.'
                  );
                  return;
                }

                const { error } =
                  await supabase.auth.resetPasswordForEmail(cleanEmail);

                if (error) {
                  Alert.alert(
                    'Unable to send instructions',
                    'Password recovery could not be started. Try again later.'
                  );
                } else {
                  Alert.alert(
                    'Request received',
                    'If this account is registered, password recovery instructions will be sent.'
                  );
                }
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Access is restricted to verified healthcare professionals.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FB' },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  back: { paddingVertical: 12, alignSelf: 'flex-start' },
  backText: { color: '#087F8C', fontSize: 15, fontWeight: '600' },
  brand: { alignItems: 'center', marginVertical: 24 },
  logo: {
    width: 58, height: 58, borderRadius: 18,
    backgroundColor: '#087F8C', alignItems: 'center',
    justifyContent: 'center', marginBottom: 10,
  },
  logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  brandName: { color: '#173042', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#708596', marginTop: 6, fontSize: 15 },
  card: {
    backgroundColor: '#FFFFFF', padding: 22, borderRadius: 20,
    borderWidth: 1, borderColor: '#E3ECF2',
  },
  heading: { fontSize: 23, fontWeight: '800', color: '#173042' },
  description: { color: '#708596', lineHeight: 21, marginTop: 8, marginBottom: 22 },
  label: { color: '#173042', fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: {
    height: 50, borderWidth: 1, borderColor: '#DCE6ED',
    borderRadius: 11, paddingHorizontal: 13, color: '#173042',
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#DCE6ED', borderRadius: 11,
  },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 13, color: '#173042' },
  showButton: { padding: 12 },
  showText: { color: '#087F8C', fontWeight: '700' },
  button: {
    minHeight: 52, marginTop: 24, borderRadius: 12,
    backgroundColor: '#087F8C', alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  forgot: { alignSelf: 'center', padding: 16 },
  forgotText: { color: '#087F8C', fontWeight: '700' },
  footer: { textAlign: 'center', color: '#708596', lineHeight: 20, marginTop: 20 },
});
