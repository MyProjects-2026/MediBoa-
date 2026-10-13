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
import { router, useFocusEffect } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useMediboaRealtime } from '../lib/mediboa-realtime';
import {
  getCurrentProfile,
  requireRole,
  signOutAndReturnHome,
  type MediBoaProfile,
} from '@/lib/mediboa-auth';

const C = {
  primary: '#087F8C',
  dark: '#173A45',
  background: '#F4F8FA',
  white: '#FFFFFF',
  muted: '#71858D',
  border: '#E3ECEF',
  tealLight: '#E0F5F2',
  blueLight: '#E8F2FF',
  purpleLight: '#F0EBFF',
  orangeLight: '#FFF1DF',
  green: '#16805D',
  red: '#B42318',
  amber: '#9A6700',
  dangerLight: '#FDECEC',
  greenLight: '#E6F6EF',
};

type Appointment = {
  id: string;
  patient_id: string;
  scheduled_at: string;
  reason: string | null;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  professional_id: string | null;
  created_at?: string;
};

type AppointmentAction = 'accept' | 'decline';

const STATUS_LABELS: Record<Appointment['status'], string> = {
  requested: 'Awaiting response',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No-show',
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: Appointment['status']): string {
  switch (status) {
    case 'confirmed':
      return C.green;
    case 'completed':
      return C.primary;
    case 'cancelled':
      return C.red;
    case 'no_show':
      return C.amber;
    default:
      return C.primary;
  }
}

function getStatusBackground(status: Appointment['status']): string {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return C.greenLight;
    case 'cancelled':
      return C.dangerLight;
    case 'no_show':
      return C.orangeLight;
    default:
      return C.tealLight;
  }
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.featureIcon, { backgroundColor: color }]}>
        <Text style={styles.featureEmoji}>{icon}</Text>
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
      <Text style={styles.featureAction}>Open →</Text>
    </Pressable>
  );
}

function AppointmentCard({
  appointment,
  busy,
  onRespond,
  onUpdateStatus,
}: {
  appointment: Appointment;
  busy: boolean;
  onRespond: (appointment: Appointment, action: AppointmentAction) => void;
  onUpdateStatus: (
    appointment: Appointment,
    status: 'completed' | 'cancelled' | 'no_show'
  ) => void;
}) {
  const isUnassigned =
    appointment.status === 'requested' && !appointment.professional_id;

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTop}>
        <View style={styles.appointmentIcon}>
          <Text style={styles.appointmentIconText}>📅</Text>
        </View>

        <View style={styles.appointmentMain}>
          <Text style={styles.appointmentTitle}>
            {isUnassigned ? 'New appointment request' : 'Your appointment'}
          </Text>
          <Text style={styles.appointmentDate}>
            {formatDate(appointment.scheduled_at)} ·{' '}
            {formatTime(appointment.scheduled_at)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusBackground(appointment.status) },
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            { color: getStatusColor(appointment.status) },
          ]}
        >
          {STATUS_LABELS[appointment.status]}
        </Text>
      </View>

      {appointment.reason ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason provided</Text>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </View>
      ) : (
        <Text style={styles.noReason}>No reason provided.</Text>
      )}

      {isUnassigned ? (
        <View style={styles.actionRow}>
          <Pressable
            disabled={busy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.acceptButton,
              pressed && styles.pressed,
              busy && styles.disabledButton,
            ]}
            onPress={() => onRespond(appointment, 'accept')}
            accessibilityRole="button"
          >
            <Text style={styles.acceptButtonText}>
              {busy ? 'Please wait…' : 'Accept'}
            </Text>
          </Pressable>

          <Pressable
            disabled={busy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.declineButton,
              pressed && styles.pressed,
              busy && styles.disabledButton,
            ]}
            onPress={() => onRespond(appointment, 'decline')}
            accessibilityRole="button"
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </Pressable>
        </View>
      ) : appointment.status === 'confirmed' ? (
        <View style={styles.statusActions}>
          <Pressable
            disabled={busy}
            style={({ pressed }) => [
              styles.completeButton,
              pressed && styles.pressed,
              busy && styles.disabledButton,
            ]}
            onPress={() => onUpdateStatus(appointment, 'completed')}
            accessibilityRole="button"
          >
            <Text style={styles.completeButtonText}>
              {busy ? 'Please wait…' : 'Mark completed'}
            </Text>
          </Pressable>

          <View style={styles.actionRow}>
            <Pressable
              disabled={busy}
              style={[styles.smallAction, busy && styles.disabledButton]}
              onPress={() => onUpdateStatus(appointment, 'cancelled')}
              accessibilityRole="button"
            >
              <Text style={styles.smallActionText}>Cancel</Text>
            </Pressable>

            <Pressable
              disabled={busy}
              style={[styles.smallAction, busy && styles.disabledButton]}
              onPress={() => onUpdateStatus(appointment, 'no_show')}
              accessibilityRole="button"
            >
              <Text style={styles.smallActionText}>Mark no-show</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function ProfessionalDashboardScreen() {
  const [profile, setProfile] = useState<MediBoaProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setScreenError(null);

    try {
      const { data, error } = await supabase.rpc(
        'professional_list_appointments'
      );

      if (error) {
        throw error;
      }

      setAppointments((data ?? []) as Appointment[]);
    } catch (error) {
      console.error('Professional appointment loading failed:', error);
      setScreenError(
        'Appointments could not be loaded. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const authorisedProfile = await requireRole(['professional']);

      if (!mounted) return;

      if (!authorisedProfile) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setProfile(authorisedProfile);
      setAuthorized(true);

      await loadAppointments();
    }

    void checkAccess();

    return () => {
      mounted = false;
    };
  }, [loadAppointments]);

    useMediboaRealtime(['appointments', 'profiles'], () => loadAppointments());

useFocusEffect(
    useCallback(() => {
      let active = true;

      async function refreshOnFocus() {
        const current = await getCurrentProfile();

        if (!active) return;

        if (
          !current ||
          current.role !== 'professional' ||
          current.account_status !== 'active'
        ) {
          setAuthorized(false);
          router.replace('/professional-login');
          return;
        }

        setProfile(current);
        setAuthorized(true);
        await loadAppointments(true);
      }

      void refreshOnFocus();

      return () => {
        active = false;
      };
    }, [loadAppointments])
  );

  const respondToAppointment = useCallback(
    (appointment: Appointment, action: AppointmentAction) => {
      const isAccept = action === 'accept';

      Alert.alert(
        isAccept ? 'Accept appointment?' : 'Decline appointment?',
        isAccept
          ? 'This request will be assigned to you and marked as confirmed.'
          : 'This request will be assigned to you for handling and marked as cancelled.',
        [
          { text: 'Go back', style: 'cancel' },
          {
            text: isAccept ? 'Accept request' : 'Decline request',
            style: isAccept ? 'default' : 'destructive',
            onPress: () => {
              void (async () => {
                setBusyId(appointment.id);

                try {
                  const { data, error } = await supabase.rpc(
                    'professional_respond_to_appointment',
                    {
                      p_appointment_id: appointment.id,
                      p_action: action,
                    }
                  );

                  if (error) throw error;

                  if (!data || data.length === 0) {
                    throw new Error('No appointment was updated.');
                  }

                  Alert.alert(
                    'Success',
                    isAccept
                      ? 'The appointment has been confirmed and assigned to you.'
                      : 'The appointment request has been declined.'
                  );

                  await loadAppointments(true);
                } catch (error) {
                  console.error('Appointment response failed:', error);

                  Alert.alert(
                    'Action unsuccessful',
                    'We could not update this request. It may already have been handled. Refresh the list and try again.'
                  );

                  await loadAppointments(true);
                } finally {
                  setBusyId(null);
                }
              })();
            },
          },
        ]
      );
    },
    [loadAppointments]
  );

  const updateAppointmentStatus = useCallback(
    (
      appointment: Appointment,
      status: 'completed' | 'cancelled' | 'no_show'
    ) => {
      const labels = {
        completed: 'mark this appointment as completed',
        cancelled: 'cancel this appointment',
        no_show: 'mark this appointment as no-show',
      };

      Alert.alert(
        'Confirm status change',
        `Are you sure you want to ${labels[status]}?`,
        [
          { text: 'Go back', style: 'cancel' },
          {
            text: 'Confirm',
            style: status === 'cancelled' ? 'destructive' : 'default',
            onPress: () => {
              void (async () => {
                setBusyId(appointment.id);

                try {
                  const { data, error } = await supabase.rpc(
                    'professional_update_appointment_status',
                    {
                      p_appointment_id: appointment.id,
                      p_new_status: status,
                    }
                  );

                  if (error) throw error;

                  if (!data || data.length === 0) {
                    throw new Error('No appointment was updated.');
                  }

                  Alert.alert(
                    'Success',
                    `Appointment status updated to ${STATUS_LABELS[status]}.`
                  );

                  await loadAppointments(true);
                } catch (error) {
                  console.error('Appointment status update failed:', error);

                  Alert.alert(
                    'Update unsuccessful',
                    'The appointment status could not be changed. Refresh the list and try again.'
                  );

                  await loadAppointments(true);
                } finally {
                  setBusyId(null);
                }
              })();
            },
          },
        ]
      );
    },
    [loadAppointments]
  );

  const showFeature = (name: string) => {
    Alert.alert(
      name,
      'This section has not been implemented yet. Appointment management is available in this dashboard.'
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Are you sure you want to end your professional session?',
      [
        { text: 'Stay signed in', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            void signOutAndReturnHome();
          },
        },
      ]
    );
  };

  const requestedCount = appointments.filter(
    (a) => a.status === 'requested' && !a.professional_id
  ).length;

  const confirmedCount = appointments.filter(
    (a) => a.status === 'confirmed'
  ).length;

  const displayedName = profile?.full_name?.trim() || 'Professional';

  if (!authorized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.background} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.centerStateText}>
            Verifying professional access…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadAppointments(true)}
            tintColor={C.primary}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.brand}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
          >
            <View style={styles.logo}>
              <Text style={styles.logoText}>M+</Text>
            </View>

            <View>
              <Text style={styles.brandName}>
                MediBoa<Text style={styles.brandPlus}>+</Text>
              </Text>
              <Text style={styles.brandCaption}>PROFESSIONAL PORTAL</Text>
            </View>
          </Pressable>

          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {displayedName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>HEALTHCARE PROFESSIONALS</Text>
        <Text style={styles.pageTitle}>Your professional workspace</Text>
        <Text style={styles.subtitle}>
          Welcome, {displayedName}. Review appointment requests and manage your
          assigned appointments.
        </Text>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>✚</Text>
          </View>

          <Text style={styles.welcomeTitle}>Your workspace is connected</Text>
          <Text style={styles.welcomeDescription}>
            Appointment requests are loaded from MediBoa+. Patient clinical
            records are not displayed on this screen.
          </Text>

          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>PROFESSIONAL ACCESS</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{requestedCount}</Text>
            <Text style={styles.statLabel}>New requests</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{confirmedCount}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointments</Text>

          <Pressable
            style={styles.refreshButton}
            onPress={() => void loadAppointments(true)}
            disabled={loading || refreshing}
            accessibilityRole="button"
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.stateTitle}>Loading appointments…</Text>
          </View>
        ) : screenError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load appointments</Text>
            <Text style={styles.errorText}>{screenError}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => void loadAppointments()}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptyDescription}>
              New patient requests will appear here when they are submitted.
            </Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              busy={busyId === appointment.id}
              onRespond={respondToAppointment}
              onUpdateStatus={updateAppointmentStatus}
            />
          ))
        )}

        <Text style={styles.sectionTitle}>Other workspace tools</Text>

        <View style={styles.grid}>
          <FeatureCard
            icon="👥"
            title="Patients"
            description="Patient-management tools"
            color={C.blueLight}
            onPress={() => showFeature('Patient management')}
          />

          <FeatureCard
            icon="🕒"
            title="My schedule"
            description="Availability and working hours"
            color={C.purpleLight}
            onPress={() => showFeature('My schedule')}
          />

          <FeatureCard
            icon="🔔"
            title="Notifications"
            description="Updates and reminders"
            color={C.orangeLight}
            onPress={() => showFeature('Notifications')}
          />

          <FeatureCard
            icon="♙"
            title="Professional profile"
            description="Profile details and verification"
            color={C.tealLight}
            onPress={() => showFeature('Professional profile')}
          />
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>
              Protect patient information
            </Text>
            <Text style={styles.securityDescription}>
              Appointment access is checked by the backend. This dashboard does
              not expose clinical records. Additional role-based access and
              end-to-end workflow testing are required before clinical use.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.signInButton}
          onPress={handleSignOut}
          accessibilityRole="button"
        >
          <Text style={styles.signInButtonText}>Sign out securely</Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/')}
          accessibilityRole="button"
        >
          <Text style={styles.homeButtonText}>Return to MediBoa+ home</Text>
        </Pressable>

        <Text style={styles.footer}>
          MediBoa+ · Professional workspace
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
  },
  brandName: {
    color: C.dark,
    fontSize: 21,
    fontWeight: '900',
  },
  brandPlus: {
    color: C.primary,
  },
  brandCaption: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  profileAvatar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: C.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  eyebrow: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 9,
  },
  pageTitle: {
    color: C.dark,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 22,
  },
  welcomeCard: {
    backgroundColor: C.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  welcomeIconText: {
    color: C.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  welcomeTitle: {
    color: C.dark,
    fontSize: 16,
    fontWeight: '900',
  },
  welcomeDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 13,
  },
  previewBadgeText: {
    color: C.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 15,
  },
  statNumber: {
    color: C.dark,
    fontSize: 25,
    fontWeight: '900',
  },
  statLabel: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.dark,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  refreshButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: C.tealLight,
    marginBottom: 14,
  },
  refreshButtonText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  appointmentCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appointmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentIconText: {
    fontSize: 21,
  },
  appointmentMain: {
    flex: 1,
  },
  appointmentTitle: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '900',
  },
  appointmentDate: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 13,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  reasonBox: {
    backgroundColor: C.background,
    borderRadius: 10,
    padding: 11,
    marginTop: 13,
  },
  reasonLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 5,
  },
  reasonText: {
    color: C.dark,
    fontSize: 12,
    lineHeight: 18,
  },
  noReason: {
    color: C.muted,
    fontSize: 11,
    marginTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  acceptButton: {
    backgroundColor: C.primary,
  },
  acceptButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },
  declineButton: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#E7B8B5',
  },
  declineButtonText: {
    color: C.red,
    fontSize: 12,
    fontWeight: '900',
  },
  statusActions: {
    marginTop: 14,
  },
  completeButton: {
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },
  smallAction: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  smallActionText: {
    color: C.dark,
    fontSize: 11,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.5,
  },
  stateCard: {
    backgroundColor: C.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  stateTitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: C.dangerLight,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  errorTitle: {
    color: C.red,
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    color: C.dark,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.white,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  retryButtonText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyIcon: {
    fontSize: 29,
    marginBottom: 10,
  },
  emptyTitle: {
    color: C.dark,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '44%',
    minHeight: 165,
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
  },
  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 22,
  },
  featureTitle: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '900',
  },
  featureDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  featureAction: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 'auto',
    paddingTop: 12,
  },
  securityCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#E7F5F2',
    borderRadius: 15,
    padding: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 19,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    color: '#17645F',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  securityDescription: {
    color: '#527875',
    fontSize: 11,
    lineHeight: 17,
  },
  signInButton: {
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#B9DCDD',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  signInButtonText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  homeButton: {
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: '#8A9BA1',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 15,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerStateText: {
    color: C.muted,
    fontSize: 13,
    marginTop: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});