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
import { getCurrentProfile } from '../lib/mediboa-auth';
import {
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
export default function PatientLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email address and password.'
      );
      return;
    }
    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!emailIsValid) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Configuration required',
        'Supabase is not configured. Check your project URL and public client key in the .env file.'
      );
      return;
    }
    if (loading || resetLoading) return;
    setLoading(true);
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      if (error) {
        Alert.alert(
          'Sign-in failed',
          'We could not sign you in. Check your email and password, then try again. If you do not have an account, create one first.'
        );
        return;
      }
      if (!data.session || !data.user) {
        Alert.alert(
          'Sign-in incomplete',
          'Your session could not be established. Please try again.'
        );
        return;
      }
      const profile = await getCurrentProfile();

      if (!profile || profile.account_status !== 'active') {
        await supabase.auth.signOut();
        Alert.alert(
          'Account unavailable',
          'Your account profile could not be verified or is not active.'
        );
        return;
      }

      const destination =
        profile.role === 'admin'
          ? '/admin-dashboard'
          : profile.role === 'professional'
            ? '/professional-dashboard'
            : '/patient-dashboard';

      Alert.alert(
        'Welcome to MediBoa+',
        'Your account has been verified.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace(destination),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Connection error',
        'We could not connect to the authentication service. Check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert(
        'Email required',
        'Enter your email address first so we know where to send the recovery instructions.'
      );
      return;
    }
    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!emailIsValid) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Configuration required',
        'Password recovery is unavailable until Supabase is configured.'
      );
      return;
    }
    if (resetLoading || loading) return;
    setResetLoading(true);
    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        Alert.alert(
          'Unable to send recovery email',
          'We could not process your request. Please try again later.'
        );
        return;
      }
      Alert.alert(
        'Check your email',
        'If an account exists for this address, password recovery instructions will be sent. Check your inbox and spam folder.'
      );
    } catch {
      Alert.alert(
        'Connection error',
        'We could not contact the recovery service. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          accessibilityLabel="Return to home"
        >
          <Text style={styles.backText}>
            ‹  Back to home
          </Text>
        </TouchableOpacity>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M+</Text>
          </View>
          <Text style={styles.brandName}>
            MediBoa<Text style={styles.brandPlus}>+</Text>
          </Text>
          <Text style={styles.tagline}>
            Healthcare, closer to you.
          </Text>
        </View>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.userIcon}>☺</Text>
          </View>
          <Text style={styles.title}>
            Welcome back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to access your patient account.
          </Text>
          <Text style={styles.label}>
            Email address
          </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading && !resetLoading}
            accessibilityLabel="Email address"
            returnKeyType="next"
          />
          <Text style={styles.label}>
            Password
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              editable={!loading && !resetLoading}
              accessibilityLabel="Password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() =>
                setShowPassword(!showPassword)
              }
              style={styles.showButton}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handlePasswordReset}
            disabled={resetLoading || loading}
            accessibilityRole="button"
          >
            {resetLoading ? (
              <ActivityIndicator
                color="#087F8C"
                size="small"
              />
            ) : (
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading || resetLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in to patient account"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                Sign in
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.switchText}>
            Are you a healthcare professional?
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/professional-login')
            }
            disabled={loading || resetLoading}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              Professional sign in
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.switchText}>
            New to MediBoa+?
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() =>
              router.push('/patient-register')
            }
            disabled={loading || resetLoading}
            accessibilityRole="button"
            accessibilityLabel="Create a patient account"
          >
            <Text style={styles.registerButtonText}>
              Create a patient account
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyIcon}>
            🔒
          </Text>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>
              Your privacy matters
            </Text>
            <Text style={styles.privacyText}>
              Never share your password with anyone. Use only
              your own account. Patient records must be protected
              by appropriate database permissions before real
              health information is stored.
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>
          MediBoa+ · Healthcare for everyone
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    color: '#42636B',
    fontSize: 15,
    fontWeight: '600',
  },
  brand: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 26,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#087F8C',
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
    color: '#173A45',
    letterSpacing: -0.8,
  },
  brandPlus: {
    color: '#0891B2',
  },
  tagline: {
    color: '#71858D',
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5EDF0',
    shadowColor: '#173A45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DDF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  userIcon: {
    color: '#087F8C',
    fontSize: 31,
    fontWeight: '600',
  },
  title: {
    color: '#173A45',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#71858D',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    color: '#294751',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#173A45',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 21,
  },
  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 15,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#173A45',
    fontSize: 15,
  },
  showButton: {
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  showText: {
    color: '#087F8C',
    fontWeight: '700',
    fontSize: 13,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginBottom: 18,
  },
  forgotText: {
    color: '#087F8C',
    fontSize: 13,
    fontWeight: '700',
  },
  loginButton: {
    minHeight: 53,
    borderRadius: 13,
    backgroundColor: '#087F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EFF1',
    marginVertical: 24,
  },
  switchText: {
    color: '#71858D',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#B9DCDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FCFC',
  },
  secondaryButtonText: {
    color: '#087F8C',
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    minHeight: 53,
    borderRadius: 13,
    backgroundColor: '#087F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: '#E8F6F4',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    color: '#17645F',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  privacyText: {
    color: '#527875',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    textAlign: 'center',
    color: '#8A9BA1',
    fontSize: 12,
    marginTop: 24,
  },
});