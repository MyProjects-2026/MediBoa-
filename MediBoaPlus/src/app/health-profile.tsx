import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

import { useMediboaRealtime } from '../lib/mediboa-realtime';
const C = {
  primary: '#087F8C',
  primaryDark: '#066672',
  background: '#F4F8FA',
  white: '#FFFFFF',
  text: '#173A45',
  muted: '#71858D',
  border: '#E3ECEF',
  paleTeal: '#E0F5F2',
  danger: '#B42318',
  paleRed: '#FEE4E2',
};

type HealthForm = {
  date_of_birth: string;
  sex_at_birth: string;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  current_medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

const EMPTY_FORM: HealthForm = {
  date_of_birth: '',
  sex_at_birth: '',
  blood_type: '',
  allergies: '',
  chronic_conditions: '',
  current_medications: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad';
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#91A2A8"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize="sentences"
        style={[styles.input, multiline && styles.multilineInput]}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={label}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default function HealthProfileScreen() {
  const [form, setForm] = useState<HealthForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasProfile, setHasProfile] = useState(false);

  const updateField = (key: keyof HealthForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setError('Please sign in to access your health profile.');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('health_profiles')
        .select(
          'date_of_birth, sex_at_birth, blood_type, allergies, chronic_conditions, current_medications, emergency_contact_name, emergency_contact_phone'
        )
        .eq('patient_id', user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      if (data) {
        setForm({
          date_of_birth: data.date_of_birth ?? '',
          sex_at_birth: data.sex_at_birth ?? '',
          blood_type: data.blood_type ?? '',
          allergies: data.allergies ?? '',
          chronic_conditions: data.chronic_conditions ?? '',
          current_medications: data.current_medications ?? '',
          emergency_contact_name: data.emergency_contact_name ?? '',
          emergency_contact_phone: data.emergency_contact_phone ?? '',
        });
        setHasProfile(true);
      } else {
        setForm(EMPTY_FORM);
        setHasProfile(false);
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load your health profile.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    setError('');

    const date = form.date_of_birth.trim();

    if (date) {
      const validFormat = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const parsed = new Date(`${date}T00:00:00Z`);

      if (
        !validFormat ||
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date
      ) {
        Alert.alert(
          'Check your date',
          'Enter the date as YYYY-MM-DD, for example 2000-05-21.'
        );
        return;
      }

      if (date > new Date().toISOString().slice(0, 10)) {
        Alert.alert(
          'Check your date',
          'Date of birth cannot be in the future.'
        );
        return;
      }
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error('Please sign in again before saving your profile.');
      }

      const payload = {
        patient_id: user.id,
        date_of_birth: date || null,
        sex_at_birth: form.sex_at_birth.trim() || null,
        blood_type: form.blood_type.trim() || null,
        allergies: form.allergies.trim() || null,
        chronic_conditions: form.chronic_conditions.trim() || null,
        current_medications: form.current_medications.trim() || null,
        emergency_contact_name:
          form.emergency_contact_name.trim() || null,
        emergency_contact_phone:
          form.emergency_contact_phone.trim() || null,
      };

      const { error: saveError } = await supabase
        .from('health_profiles')
        .upsert(payload, { onConflict: 'patient_id' });

      if (saveError) throw saveError;

      setHasProfile(true);

      Alert.alert(
        'Profile saved',
        'Your health profile has been saved successfully.'
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'An unexpected error occurred.';

      setError(message);

      Alert.alert(
        'Unable to save',
        `${message}\n\nPlease check your connection and database permissions.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  useMediboaRealtime(['health_profiles'], () => loadProfile());


    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>
            Loading your health profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>M+</Text>
              </View>
              <View>
                <Text style={styles.brandName}>
                  MediBoa<Text style={styles.brandPlus}>+</Text>
                </Text>
                <Text style={styles.brandCaption}>HEALTH PROFILE</Text>
              </View>
            </View>
          </View>

          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <Text style={styles.introEmoji}>♥</Text>
            </View>
            <Text style={styles.title}>Your health profile</Text>
            <Text style={styles.description}>
              Keep your health information organised in one place. You can
              update these details whenever necessary.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Something needs attention</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                onPress={() => void loadProfile()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
              {!error.includes('sign in') ? null : (
                <Pressable
                  onPress={() => router.replace('/patient-login')}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Go to sign in</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Your privacy matters</Text>
            <Text style={styles.noticeText}>
              Only enter information you are comfortable storing in this
              application. Use test information until the app's security
              controls have been fully tested.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal health details</Text>

            <Field
              label="Date of birth"
              value={form.date_of_birth}
              onChangeText={(v) => updateField('date_of_birth', v)}
              placeholder="YYYY-MM-DD"
              hint="Year-month-day format."
            />

            <Field
              label="Sex assigned at birth"
              value={form.sex_at_birth}
              onChangeText={(v) => updateField('sex_at_birth', v)}
              placeholder="Enter if you wish"
            />

            <Field
              label="Blood type"
              value={form.blood_type}
              onChangeText={(v) => updateField('blood_type', v)}
              placeholder="e.g. O+, A−, or unknown"
            />

            <Field
              label="Allergies"
              value={form.allergies}
              onChangeText={(v) => updateField('allergies', v)}
              placeholder="Known allergies, or none known"
              multiline
            />

            <Field
              label="Chronic conditions"
              value={form.chronic_conditions}
              onChangeText={(v) => updateField('chronic_conditions', v)}
              placeholder="Conditions you want recorded"
              multiline
            />

            <Field
              label="Current medications"
              value={form.current_medications}
              onChangeText={(v) => updateField('current_medications', v)}
              placeholder="Medication names and details, if applicable"
              multiline
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Emergency contact</Text>
            <Text style={styles.sectionDescription}>
              Add someone who may be contacted in an emergency.
            </Text>

            <Field
              label="Contact name"
              value={form.emergency_contact_name}
              onChangeText={(v) =>
                updateField('emergency_contact_name', v)
              }
              placeholder="Full name"
            />

            <Field
              label="Contact phone"
              value={form.emergency_contact_phone}
              onChangeText={(v) =>
                updateField('emergency_contact_phone', v)
              }
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>

          <Pressable
            onPress={saveProfile}
            disabled={saving}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.saveButton,
              pressed && !saving && styles.pressed,
              saving && styles.disabledButton,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasProfile ? 'Save changes' : 'Save health profile'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            {hasProfile
              ? 'Your saved profile will be loaded when you return.'
              : 'Your information will be saved to your account when you continue.'}
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.cancelButton}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Return to dashboard</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: { color: C.text, fontSize: 32, lineHeight: 35 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { color: C.white, fontWeight: '800', fontSize: 16 },
  brandName: { fontSize: 20, fontWeight: '800', color: C.text },
  brandPlus: { color: C.primary },
  brandCaption: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: C.muted,
    marginTop: 2,
  },
  intro: { alignItems: 'center', marginBottom: 24 },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.paleTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  introEmoji: { fontSize: 30, color: C.primary },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 340,
  },
  notice: {
    backgroundColor: C.paleTeal,
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },
  noticeTitle: {
    color: C.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  noticeText: { color: C.text, fontSize: 12, lineHeight: 19 },
  formCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginBottom: 14,
  },
  field: { marginTop: 14 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FBFDFE',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  multilineInput: { minHeight: 92, paddingTop: 13 },
  hint: { fontSize: 11, color: C.muted, marginTop: 6 },
  errorBox: {
    backgroundColor: C.paleRed,
    borderColor: '#FDA29B',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorTitle: {
    color: C.danger,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  errorText: { color: C.text, fontSize: 12, lineHeight: 18 },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.white,
    borderRadius: 8,
  },
  retryText: { color: C.primaryDark, fontWeight: '800' },
  saveButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveButtonText: { color: C.white, fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.65 },
  pressed: { opacity: 0.8 },
  footerText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 13,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 6,
  },
  cancelText: { color: C.primaryDark, fontWeight: '700', fontSize: 14 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 14, color: C.muted, fontSize: 14 },
});
