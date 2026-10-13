import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useMediboaRealtime } from '../lib/mediboa-realtime';
import { requireRole } from '../lib/mediboa-auth';

type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

type Appointment = {
  id: string;
  patient_id: string;
  professional_id: string | null;
  scheduled_at: string;
  reason: string | null;
  status: AppointmentStatus;
};

type Professional = {
  id: string;
  full_name: string | null;
  account_status: string;
};

const C = {
  background: '#F4F8FB',
  white: '#FFFFFF',
  text: '#173042',
  muted: '#708596',
  border: '#E3ECF2',
  primary: '#087F8C',
  red: '#B42318',
  green: '#16805D',
};

const STATUSES: AppointmentStatus[] = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

export default function AdminAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const admin = await requireRole(['admin']);
      if (!admin) throw new Error('Administrator access required.');

      const [appointmentResult, professionalResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, patient_id, professional_id, scheduled_at, reason, status')
          .order('scheduled_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, account_status')
          .eq('role', 'professional')
          .eq('account_status', 'active')
          .order('full_name', { ascending: true }),
      ]);

      if (appointmentResult.error) throw appointmentResult.error;
      if (professionalResult.error) throw professionalResult.error;

      setAppointments((appointmentResult.data ?? []) as Appointment[]);
      setProfessionals((professionalResult.data ?? []) as Professional[]);
    } catch (error) {
      console.error('Loading administrator appointments failed:', error);
      setErrorMessage(
        'Unable to load appointments or available professionals. Check administrator database permissions and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

    useMediboaRealtime(['appointments', 'profiles'], () => loadData());

useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const updateAppointment = (
    appointment: Appointment,
    changes: Partial<Pick<Appointment, 'professional_id' | 'status'>>,
    confirmationTitle: string,
    confirmationMessage: string
  ) => {
    Alert.alert(confirmationTitle, confirmationMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: changes.status === 'cancelled' ? 'destructive' : 'default',
        onPress: () => {
          void (async () => {
            setBusyId(appointment.id);

            try {
              const admin = await requireRole(['admin']);
              if (!admin) throw new Error('Administrator access required.');

              const { data, error } = await supabase
                .from('appointments')
                .update(changes)
                .eq('id', appointment.id)
                .select('id, status, professional_id');

              if (error) throw error;
              if (!data || data.length === 0) {
                throw new Error('No appointment was updated.');
              }

              Alert.alert('Success', 'The appointment was updated.');
              await loadData();
            } catch (error) {
              console.error('Administrator appointment update failed:', error);
              Alert.alert(
                'Update failed',
                'The database did not confirm this change. Check the database policies and appointment status rules, then retry.'
              );
            } finally {
              setBusyId(null);
            }
          })();
        },
      },
    ]);
  };

  const chooseProfessional = (appointment: Appointment) => {
    if (professionals.length === 0) {
      Alert.alert(
        'No available professionals',
        'There are currently no active professional accounts available for assignment.'
      );
      return;
    }

    Alert.alert(
      'Assign healthcare professional',
      'Choose an active professional for this appointment.',
      [
        ...professionals.slice(0, 8).map(professional => ({
          text: professional.full_name?.trim() || 'Unnamed professional',
          onPress: () => {
            updateAppointment(
              appointment,
              {
                professional_id: professional.id,
                status:
                  appointment.status === 'requested'
                    ? 'confirmed'
                    : appointment.status,
              },
              'Confirm assignment?',
              `Assign this appointment to ${professional.full_name || 'this professional'}?`
            );
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Administrator dashboard</Text>
        </Pressable>

        <Text style={styles.brand}>MediBoa+</Text>
        <Text style={styles.title}>Appointment management</Text>
        <Text style={styles.subtitle}>
          Review live requests, assign professionals, and manage appointment statuses.
        </Text>

        <View style={styles.summary}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{appointments.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {appointments.filter(a => a.status === 'requested').length}
            </Text>
            <Text style={styles.summaryLabel}>Requested</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {appointments.filter(a => a.status === 'confirmed').length}
            </Text>
            <Text style={styles.summaryLabel}>Confirmed</Text>
          </View>
        </View>

        {loading && appointments.length === 0 ? (
          <ActivityIndicator size="large" color={C.primary} />
        ) : null}

        {errorMessage ? (
          <View style={styles.card}>
            <Text style={styles.error}>{errorMessage}</Text>
            <Pressable onPress={() => void loadData()} style={styles.button}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !errorMessage && appointments.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.name}>No appointments yet</Text>
            <Text style={styles.muted}>
              New patient appointment requests will appear here.
            </Text>
          </View>
        ) : null}

        {appointments.map(appointment => {
          const assigned = professionals.find(
            professional => professional.id === appointment.professional_id
          );

          return (
            <View key={appointment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>Appointment</Text>
                <Text style={styles.status}>{appointment.status}</Text>
              </View>

              <Text style={styles.detail}>
                Date: {new Date(appointment.scheduled_at).toLocaleString()}
              </Text>
              <Text style={styles.detail}>
                Patient ID: {appointment.patient_id}
              </Text>
              <Text style={styles.detail}>
                Professional:{' '}
                {assigned?.full_name ||
                  (appointment.professional_id
                    ? 'Assigned professional'
                    : 'Not assigned')}
              </Text>
              <Text style={styles.detail}>
                Reason: {appointment.reason?.trim() || 'Not provided'}
              </Text>
              <Text style={styles.detail}>ID: {appointment.id}</Text>

              {busyId === appointment.id ? (
                <ActivityIndicator
                  style={styles.progress}
                  color={C.primary}
                />
              ) : (
                <>
                  <Pressable
                    onPress={() => chooseProfessional(appointment)}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>
                      {appointment.professional_id
                        ? 'Reassign professional'
                        : 'Assign professional'}
                    </Text>
                  </Pressable>

                  <Text style={styles.actionLabel}>Change status</Text>
                  <View style={styles.statusOptions}>
                    {STATUSES.filter(
                      status => status !== appointment.status
                    ).map(status => (
                      <Pressable
                        key={status}
                        onPress={() =>
                          updateAppointment(
                            appointment,
                            { status },
                            'Update appointment status?',
                            `Change this appointment from "${appointment.status}" to "${status}"?`
                          )
                        }
                        style={styles.statusButton}
                      >
                        <Text style={styles.statusButtonText}>{status}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })}

        <Pressable onPress={() => void loadData()} style={styles.refresh}>
          <Text style={styles.backText}>Refresh appointments</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  content: { padding: 20, paddingBottom: 45 },
  back: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: C.primary, fontWeight: '800' },
  brand: { color: C.primary, fontSize: 18, fontWeight: '900', marginTop: 12 },
  title: { color: C.text, fontSize: 27, fontWeight: '900', marginTop: 14 },
  subtitle: { color: C.muted, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  summary: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  summaryCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 13, padding: 13,
    borderWidth: 1, borderColor: C.border,
  },
  summaryNumber: { color: C.text, fontSize: 23, fontWeight: '900' },
  summaryLabel: { color: C.muted, fontSize: 11, marginTop: 5 },
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 15,
    marginBottom: 13, borderWidth: 1, borderColor: C.border,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: 8,
  },
  name: { color: C.text, fontSize: 15, fontWeight: '900' },
  status: {
    color: C.primary, backgroundColor: '#DDF4F0',
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12,
    fontSize: 11, fontWeight: '800',
  },
  detail: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  muted: { color: C.muted, lineHeight: 20, marginTop: 8 },
  button: {
    alignSelf: 'flex-start', backgroundColor: C.primary,
    borderRadius: 9, paddingVertical: 10, paddingHorizontal: 13, marginTop: 13,
  },
  buttonText: { color: C.white, fontSize: 12, fontWeight: '800' },
  actionLabel: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 16 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  statusButton: {
    borderWidth: 1, borderColor: C.border, borderRadius: 9,
    paddingVertical: 8, paddingHorizontal: 10, backgroundColor: C.background,
  },
  statusButtonText: { color: C.text, fontSize: 11, fontWeight: '700' },
  progress: { marginTop: 15 },
  error: { color: C.red, lineHeight: 20 },
  refresh: { alignItems: 'center', padding: 15 },
});
