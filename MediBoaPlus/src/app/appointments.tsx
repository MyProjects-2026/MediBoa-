import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useMediboaRealtime } from '../lib/mediboa-realtime';
import { getCurrentProfile } from '../lib/mediboa-auth';

type Appointment = {
  id: string;
  scheduled_at: string;
  reason: string | null;
  status: string;
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);

    try {
      const profile = await getCurrentProfile();

      if (
        !profile ||
        !['patient', 'admin'].includes(profile.role) ||
        profile.account_status !== 'active'
      ) {
        Alert.alert(
          'Access required',
          'Please sign in with an active patient or administrator account.'
        );
        router.replace('/patient-login');
        return;
      }

      setIsAdmin(profile.role === 'admin');

      let query = supabase
        .from('appointments')
        .select('id, scheduled_at, reason, status');

      if (profile.role === 'patient') {
        query = query.eq('patient_id', profile.id);
      }

      const { data, error } = await query
        .order('scheduled_at', { ascending: false });

      if (error) {
        Alert.alert(
          'Unable to load appointments',
          'Please try again. If the problem continues, contact support.'
        );
        return;
      }

      setAppointments((data || []) as Appointment[]);
    } catch {
      Alert.alert('Connection error', 'Could not load your appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

    useMediboaRealtime(['appointments', 'profiles'], () => loadAppointments());

useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments])
  );

  async function requestAppointment() {
    const profile = await getCurrentProfile();

    if (
      !profile ||
      !['patient', 'admin'].includes(profile.role) ||
      profile.account_status !== 'active'
    ) {
      Alert.alert(
        'Sign-in required',
        'Sign in with an active patient or administrator account first.'
      );
      router.replace('/patient-login');
      return;
    }

    const date = new Date(scheduledAt.trim());

    if (!scheduledAt.trim() || Number.isNaN(date.getTime())) {
      Alert.alert(
        'Check the date and time',
        'Enter a valid date and time in ISO format, for example 2026-12-20T10:30:00+02:00.'
      );
      return;
    }

    if (date.getTime() <= Date.now()) {
      Alert.alert(
        'Choose a future time',
        'Appointment requests must be for a future date and time.'
      );
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('appointments').insert({
        patient_id: profile.id,
        professional_id: null,
        scheduled_at: date.toISOString(),
        reason: reason.trim() || null,
        status: 'requested',
      });

      if (error) {
        Alert.alert(
          'Request not submitted',
          'The request could not be saved. Check the date, database permissions, and try again.'
        );
        return;
      }

      setScheduledAt('');
      setReason('');

      Alert.alert(
        'Request submitted',
        'Your appointment request has been recorded. It is not confirmed until the healthcare professional approves it.'
      );

      await loadAppointments();
    } catch {
      Alert.alert('Connection error', 'Your request could not be submitted.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAppointments} />
        }
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.brand}>MediBoa<Text style={styles.plus}>+</Text></Text>
        <Text style={styles.title}>
          {isAdmin ? 'All appointments' : 'My appointments'}
        </Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Administrator overview of platform appointments.'
            : 'Request a visit and follow its status here.'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Request an appointment</Text>
          <Text style={styles.label}>Date and time</Text>
          <TextInput
            style={styles.input}
            value={scheduledAt}
            onChangeText={setScheduledAt}
            placeholder="2026-12-20T10:30:00+02:00"
            placeholderTextColor="#8193A1"
            autoCapitalize="none"
            editable={!saving}
          />
          <Text style={styles.hint}>
            Include the date, time, and your local time-zone offset.
          </Text>

          <Text style={styles.label}>Reason for visit (optional)</Text>
          <TextInput
            style={[styles.input, styles.reason]}
            value={reason}
            onChangeText={setReason}
            placeholder="Briefly describe why you need an appointment"
            placeholderTextColor="#8193A1"
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <Pressable
            style={[styles.button, saving && styles.disabled]}
            onPress={requestAppointment}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Submit request</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          {isAdmin ? 'All appointment records' : 'Appointment history'}
        </Text>

        {loading && appointments.length === 0 ? (
          <ActivityIndicator color="#087F8C" style={{ marginTop: 20 }} />
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.subtitle}>
              Your submitted requests will appear here.
            </Text>
          </View>
        ) : (
          appointments.map(item => (
            <View key={item.id} style={styles.appointment}>
              <Text style={styles.appointmentDate}>
                {new Date(item.scheduled_at).toLocaleString()}
              </Text>
              <Text style={styles.status}>
                Status: {item.status.replace(/_/g, ' ')}
              </Text>
              {item.reason ? (
                <Text style={styles.reasonText}>{item.reason}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FB' },
  content: { padding: 20, paddingBottom: 44 },
  back: { paddingVertical: 10, alignSelf: 'flex-start' },
  backText: { color: '#087F8C', fontWeight: '700', fontSize: 15 },
  brand: { color: '#173042', fontSize: 24, fontWeight: '800', marginTop: 12 },
  plus: { color: '#087F8C' },
  title: { fontSize: 29, color: '#173042', fontWeight: '800', marginTop: 22 },
  subtitle: { color: '#708596', lineHeight: 21, marginTop: 7 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18,
    marginTop: 24, borderWidth: 1, borderColor: '#E3ECF2',
  },
  cardTitle: { fontSize: 19, color: '#173042', fontWeight: '800' },
  label: { color: '#173042', fontWeight: '700', marginTop: 18, marginBottom: 8 },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: '#DCE6ED',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12,
    color: '#173042', backgroundColor: '#FFFFFF',
  },
  hint: { color: '#708596', fontSize: 12, lineHeight: 18, marginTop: 6 },
  reason: { minHeight: 90 },
  button: {
    minHeight: 50, borderRadius: 11, backgroundColor: '#087F8C',
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  disabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  sectionTitle: { color: '#173042', fontSize: 21, fontWeight: '800', marginTop: 30 },
  empty: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15,
    marginTop: 14, borderWidth: 1, borderColor: '#E3ECF2',
  },
  emptyTitle: { color: '#173042', fontWeight: '800', fontSize: 17 },
  appointment: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    marginTop: 12, borderWidth: 1, borderColor: '#E3ECF2',
  },
  appointmentDate: { color: '#173042', fontWeight: '800', fontSize: 16 },
  status: { color: '#087F8C', fontWeight: '700', marginTop: 8 },
  reasonText: { color: '#708596', marginTop: 8, lineHeight: 20 },
});
