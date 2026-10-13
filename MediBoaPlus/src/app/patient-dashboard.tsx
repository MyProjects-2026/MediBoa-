import React, { useCallback, useEffect, useState } from 'react';
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
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useMediboaRealtime } from '../lib/mediboa-realtime';
import {
  getCurrentProfile,
  requireRole,
  signOutAndReturnHome,
  type MediBoaProfile,
} from '../lib/mediboa-auth';

type Appointment = {
  id: string;
  scheduled_at: string;
  reason: string | null;
  status: string;
};

type PatientNotification = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

const C = {
  primary: '#087F8C',
  primaryDark: '#066672',
  background: '#F4F8FA',
  white: '#FFFFFF',
  text: '#173A45',
  muted: '#71858D',
  border: '#E3ECEF',
  paleTeal: '#E0F5F2',
  paleBlue: '#E8F2FF',
  paleGreen: '#E7F6EC',
  paleOrange: '#FFF1DF',
  danger: '#B42318',
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function readableStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

export default function PatientDashboardScreen() {
  const [profile, setProfile] = useState<MediBoaProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [notificationsError, setNotificationsError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    try {
      const authorisedProfile = await requireRole(['patient']);
      if (!authorisedProfile) return;

      setProfile(authorisedProfile);

      const [appointmentResult, notificationResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, scheduled_at, reason, status')
          .eq('patient_id', authorisedProfile.id)
          .order('scheduled_at', { ascending: true })
          .limit(50),
        supabase
          .from('notifications')
          .select('id, title, body, read_at, created_at')
          .eq('user_id', authorisedProfile.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (appointmentResult.error) {
        setAppointmentsError(appointmentResult.error.message);
      } else {
        setAppointmentsError('');
        setAppointments(
          (appointmentResult.data ?? []) as Appointment[]
        );
      }

      if (notificationResult.error) {
        setNotificationsError(notificationResult.error.message);
      } else {
        setNotificationsError('');
        setNotifications(
          (notificationResult.data ?? []) as PatientNotification[]
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error.';
      Alert.alert('Unable to load dashboard', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(true);
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadDashboard();
  }, [loadDashboard]);

  const openNotifications = () => {
    if (notificationsError) {
      Alert.alert(
        'Notifications unavailable',
        `We could not load your notifications:\n${notificationsError}`
      );
      return;
    }

    if (notifications.length === 0) {
      Alert.alert('Notifications', 'You have no notifications yet.');
      return;
    }

    Alert.alert(
      'Your notifications',
      notifications
        .slice(0, 8)
        .map(
          (item) =>
            `${item.read_at ? '' : '• '}${item.title}\n${item.body}\n${formatDate(item.created_at)}`
        )
        .join('\n\n')
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOutAndReturnHome();
        },
      },
    ]);
  };

  const activeAppointments = appointments.filter(
    (item) => !['completed', 'cancelled', 'no_show'].includes(item.status)
  );

  const unreadCount = notifications.filter(
    (item) => item.read_at === null
  ).length;

  if (loading) {
  useMediboaRealtime(['appointments', 'notifications', 'profiles'], () => loadDashboard());


    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={C.background} />
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading your MediBoa+ dashboard…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>M+</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.brandName}>MediBoa+</Text>
            <Text style={styles.brandSubtitle}>Your health, connected</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            style={styles.notificationButton}
            onPress={openNotifications}
          >
            <Text style={styles.notificationIcon}>♧</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.eyebrow}>PATIENT DASHBOARD</Text>
          <Text style={styles.welcomeTitle}>
            Hello, {profile?.full_name?.trim() || 'there'}!
          </Text>
          <Text style={styles.welcomeBody}>
            Keep track of your care and manage your health in one place.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your care</Text>
          <Text style={styles.sectionHint}>Quick access</Text>
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            onPress={() => router.push('/appointments')}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.paleBlue }]}>
              <Text style={styles.actionEmoji}>▦</Text>
            </View>
            <Text style={styles.actionTitle}>Appointments</Text>
            <Text style={styles.actionSubtitle}>Book and manage visits</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            onPress={() => router.push('/health-profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.paleGreen }]}>
              <Text style={styles.actionEmoji}>♡</Text>
            </View>
            <Text style={styles.actionTitle}>Health profile</Text>
            <Text style={styles.actionSubtitle}>Your health information</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Upcoming appointments</Text>
          <Pressable onPress={() => router.push('/appointments')}>
            <Text style={styles.sectionLink}>View all</Text>
          </Pressable>
        </View>

        {appointmentsError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Appointments unavailable</Text>
            <Text style={styles.errorBody}>{appointmentsError}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => void loadDashboard()}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : activeAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▦</Text>
            <Text style={styles.emptyTitle}>No upcoming appointments</Text>
            <Text style={styles.emptyBody}>
              Your upcoming appointments will appear here once booked.
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/appointments')}
            >
              <Text style={styles.primaryButtonText}>Book an appointment</Text>
            </Pressable>
          </View>
        ) : (
          activeAppointments.slice(0, 5).map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTop}>
                <Text style={styles.appointmentDate}>
                  {formatDate(appointment.scheduled_at)}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {readableStatus(appointment.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.appointmentReason}>
                {appointment.reason?.trim() || 'Healthcare appointment'}
              </Text>
            </View>
          ))
        )}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Recent notifications</Text>
          <Pressable onPress={openNotifications}>
            <Text style={styles.sectionLink}>View all</Text>
          </Pressable>
        </View>

        {notificationsError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Notifications unavailable</Text>
            <Text style={styles.errorBody}>{notificationsError}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.simpleCard}>
            <Text style={styles.simpleText}>You're all caught up.</Text>
          </View>
        ) : (
          notifications.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View
                style={[
                  styles.notificationDot,
                  item.read_at ? styles.readDot : styles.unreadDot,
                ]}
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody}>{item.body}</Text>
                <Text style={styles.notificationDate}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Signed in{profile?.phone ? ` · ${profile.phone}` : ''}
          </Text>
          <Pressable
            disabled={busy}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              if (busy) return;
              setBusy(true);
              handleSignOut();
              setBusy(false);
            }}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  loadingScreen: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 14, color: C.muted, fontSize: 14 },
  container: { padding: 20, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: { color: C.white, fontSize: 18, fontWeight: '800' },
  headerText: { flex: 1 },
  brandName: { color: C.text, fontSize: 20, fontWeight: '800' },
  brandSubtitle: { color: C.muted, fontSize: 12, marginTop: 2 },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: { fontSize: 23, color: C.primary },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: C.white, fontSize: 10, fontWeight: '800' },
  welcomeCard: {
    backgroundColor: C.primary,
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,
  },
  eyebrow: {
    color: '#C9F4EE',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  welcomeTitle: {
    color: C.white,
    fontSize: 27,
    fontWeight: '800',
    marginTop: 12,
  },
  welcomeBody: {
    color: '#E2F7F5',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 6,
  },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  sectionHint: { color: C.muted, fontSize: 12 },
  sectionLink: { color: C.primary, fontWeight: '700', fontSize: 13 },
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    minHeight: 158,
  },
  pressed: { opacity: 0.75 },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionEmoji: { fontSize: 23, color: C.primary },
  actionTitle: { color: C.text, fontWeight: '800', fontSize: 14 },
  actionSubtitle: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  emptyCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: { color: C.primary, fontSize: 32, marginBottom: 10 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  emptyBody: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
  primaryButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  primaryButtonText: { color: C.white, fontWeight: '800', fontSize: 13 },
  appointmentCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 10,
  },
  appointmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  appointmentDate: { color: C.primaryDark, fontSize: 13, fontWeight: '700', flex: 1 },
  statusPill: {
    backgroundColor: C.paleTeal,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: { color: C.primaryDark, fontSize: 10, fontWeight: '800' },
  appointmentReason: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  simpleCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 18,
    marginBottom: 22,
  },
  simpleText: { color: C.muted, fontSize: 13 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 14,
    marginBottom: 9,
    gap: 11,
  },
  notificationDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  unreadDot: { backgroundColor: C.primary },
  readDot: { backgroundColor: '#CBD5E1' },
  notificationContent: { flex: 1 },
  notificationTitle: { color: C.text, fontSize: 14, fontWeight: '800' },
  notificationBody: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  notificationDate: { color: C.muted, fontSize: 11, marginTop: 7 },
  errorCard: {
    backgroundColor: '#FFF4F2',
    borderWidth: 1,
    borderColor: '#F3C6C0',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  errorTitle: { color: C.danger, fontSize: 14, fontWeight: '800' },
  errorBody: { color: C.text, fontSize: 12, lineHeight: 18, marginTop: 6 },
  retryButton: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8 },
  retryText: { color: C.primaryDark, fontWeight: '800' },
  footer: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  footerText: { color: C.muted, fontSize: 11, flex: 1 },
  signOutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.paleOrange,
    borderRadius: 11,
  },
  signOutText: { color: C.danger, fontSize: 12, fontWeight: '800' },
});
