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
import {
  type MediBoaProfile,
  requireRole,
  signOutAndReturnHome,
} from '../lib/mediboa-auth';
const C = {
  primary: '#087F8C',
  primaryDark: '#066672',
  background: '#F4F8FB',
  white: '#FFFFFF',
  text: '#173042',
  muted: '#708596',
  border: '#E3ECF2',
  paleTeal: '#DDF4F0',
  paleBlue: '#E7F0FF',
  palePurple: '#F0EDFF',
  paleOrange: '#FFF4E2',
  green: '#16805D',
};
type MetricProps = {
  label: string;
  value: number;
  icon: string;
};
function Metric({ label, value, icon }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
function WorkspaceCard({
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
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.workspaceCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.workspaceIcon, { backgroundColor: color }]}>
        <Text style={styles.workspaceIconText}>{icon}</Text>
      </View>
      <View style={styles.workspaceCopy}>
        <Text style={styles.workspaceTitle}>{title}</Text>
        <Text style={styles.workspaceDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}
export default function AdminDashboardScreen() {
  const [profile, setProfile] = useState<MediBoaProfile | null>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [professionalCount, setProfessionalCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const authorized = await requireRole(['admin']);
      if (!authorized) {
        setProfile(null);
        return;
      }
      setProfile(authorized);
      const [patients, professionals, appointments] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'patient'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'professional'),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true }),
      ]);
      const errors = [
        patients.error,
        professionals.error,
        appointments.error,
      ].filter(Boolean);
      setPatientCount(patients.count ?? 0);
      setProfessionalCount(professionals.count ?? 0);
      setAppointmentCount(appointments.count ?? 0);
      if (errors.length > 0) {
        setLoadError(
          'Some totals could not be retrieved. Check your Supabase policies.'
        );
      }
    } catch (error) {
      console.error('Admin dashboard loading failed:', error);
      setLoadError('Unable to load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
    useMediboaRealtime(['profiles', 'appointments'], () => loadDashboard());

useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );
  const confirmSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Are you sure you want to end your administrator session?',
      [
        { text: 'Cancel', style: 'cancel' },
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
  if (!profile && loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.muted}>Verifying administrator access…</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboard} />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>M+</Text>
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>MediBoa+</Text>
            <Text style={styles.brandCaption}>CONTROL CENTRE</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ADMINISTRATION</Text>
          <Text style={styles.title}>Your workspace.</Text>
          <Text style={styles.subtitle}>
            Welcome back, {profile?.full_name?.trim() || 'Administrator'}.
            Manage and test the MediBoa+ experience from here.
          </Text>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Application overview</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadDashboard()}
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
        <View style={styles.metrics}>
          <Metric
            icon="👤"
            label="Patients"
            value={patientCount}
          />
          <Metric
            icon="✚"
            label="Professionals"
            value={professionalCount}
          />
          <Metric
            icon="▦"
            label="Appointments"
            value={appointmentCount}
          />
        </View>
        {loadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Some information is unavailable</Text>
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>Workspaces</Text>
        <Text style={styles.sectionDescription}>
          Open an application area to inspect its current functionality.
        </Text>
        <WorkspaceCard
          icon="♡"
          title="Patient experience"
          description="Open the patient dashboard and inspect its available features."
          color={C.paleTeal}
          onPress={() => router.push('/patient-dashboard')}
        />
        <WorkspaceCard
          icon="✚"
          title="Healthcare professional"
          description="Inspect appointment requests and professional tools."
          color={C.paleBlue}
          onPress={() => router.push('/professional-dashboard')}
        />
        <WorkspaceCard
          icon="⚙"
          title="Administrator"
          description="Return to your administrative control centre."
          color={C.palePurple}
          onPress={() => void loadDashboard()}
        />
        <WorkspaceCard
          icon="♙"
          title="Live user management"
          description="View registered accounts and activate or deactivate patients and professionals."
          color={C.paleOrange}
          onPress={() => router.push('/admin-users')}
        />
        <WorkspaceCard
          icon="▦"
          title="Live appointment management"
          description="Review appointment requests, assign active professionals, and update appointment statuses."
          color={C.paleTeal}
          onPress={() => router.push('/admin-appointments')}
        />
        <Text style={styles.sectionTitle}>Account and security</Text>
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Text style={styles.securityIconText}>✓</Text>
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Administrator access verified</Text>
            <Text style={styles.securityText}>
              Your administrator role is checked when this dashboard loads.
              Opening another workspace does not automatically grant permission
              to access protected patient or professional data.
            </Text>
          </View>
        </View>
        <View style={styles.securityNotice}>
          <Text style={styles.securityNoticeTitle}>Testing reminder</Text>
          <Text style={styles.securityText}>
            Use test accounts and test data when checking patient or
            professional workflows. The workspace links are navigation only;
            protected operations must continue to enforce their own permissions.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
          onPress={confirmSignOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
        <Text style={styles.footer}>MediBoa+ · Administration</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  muted: {
    color: C.muted,
    marginTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
  },
  brandCopy: {
    flex: 1,
  },
  brand: {
    color: C.text,
    fontSize: 22,
    fontWeight: '900',
  },
  brandCaption: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: C.paleTeal,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  adminBadgeText: {
    color: C.primaryDark,
    fontWeight: '900',
    fontSize: 11,
  },
  hero: {
    marginTop: 31,
    marginBottom: 26,
  },
  eyebrow: {
    color: C.primary,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1.6,
  },
  title: {
    color: C.text,
    fontSize: 31,
    fontWeight: '900',
    marginTop: 7,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 25,
  },
  refreshText: {
    color: C.primary,
    fontWeight: '800',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '28%',
    minWidth: 92,
    backgroundColor: C.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
  },
  metricIcon: {
    fontSize: 19,
  },
  metricValue: {
    color: C.text,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 10,
  },
  metricLabel: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },
  sectionDescription: {
    color: C.muted,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 9,
  },
  workspaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 11,
  },
  workspaceIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceIconText: {
    color: C.text,
    fontSize: 23,
    fontWeight: '800',
  },
  workspaceCopy: {
    flex: 1,
  },
  workspaceTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '900',
  },
  workspaceDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  arrow: {
    color: C.primary,
    fontSize: 28,
    fontWeight: '500',
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: C.paleOrange,
    borderRadius: 13,
    padding: 14,
  },
  errorTitle: {
    color: '#805817',
    fontWeight: '900',
  },
  errorText: {
    color: '#805817',
    lineHeight: 20,
    marginTop: 5,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 15,
    marginTop: 13,
  },
  securityIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.paleTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityIconText: {
    color: C.green,
    fontWeight: '900',
    fontSize: 18,
  },
  securityCopy: {
    flex: 1,
  },
  securityTitle: {
    color: C.text,
    fontWeight: '900',
    fontSize: 14,
  },
  securityText: {
    color: C.muted,
    lineHeight: 20,
    fontSize: 12,
    marginTop: 6,
  },
  securityNotice: {
    backgroundColor: C.paleOrange,
    borderRadius: 15,
    padding: 16,
    marginTop: 14,
  },
  securityNoticeTitle: {
    color: '#805817',
    fontWeight: '900',
    fontSize: 15,
  },
  signOutButton: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: C.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
  },
  signOutText: {
    color: C.white,
    fontWeight: '900',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.78,
  },
  footer: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 11,
    marginTop: 22,
  },
});