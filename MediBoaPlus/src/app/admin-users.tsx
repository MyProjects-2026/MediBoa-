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

type Account = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'patient' | 'professional';
  account_status: 'active' | 'pending' | 'disabled';
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

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<Account[]>([]);
  const [filter, setFilter] = useState<'all' | 'patient' | 'professional'>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const admin = await requireRole(['admin']);

      if (!admin) {
        setUsers([]);
        setErrorMessage('Administrator access is required.');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, account_status')
        .in('role', ['patient', 'professional'])
        .order('full_name', { ascending: true });

      if (error) throw error;

      setUsers((data ?? []) as Account[]);
    } catch (error) {
      console.error('Loading administrator user directory failed:', error);
      setErrorMessage(
        'Unable to load accounts. Check your connection and administrator database permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

    useMediboaRealtime(['profiles'], () => loadUsers());

useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers])
  );

  const changeStatus = (user: Account) => {
    const nextStatus =
      user.account_status === 'active' ? 'disabled' : 'active';

    Alert.alert(
      `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} account?`,
      `This will change ${user.full_name || 'this account'} to ${nextStatus}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: nextStatus === 'disabled' ? 'destructive' : 'default',
          onPress: () => {
            void (async () => {
              setBusyId(user.id);

              try {
                const admin = await requireRole(['admin']);
                if (!admin) throw new Error('Administrator access required.');

                const { data, error } = await supabase
                  .from('profiles')
                  .update({ account_status: nextStatus })
                  .eq('id', user.id)
                  .select('id, account_status');

                if (error) throw error;
                if (!data || data.length === 0) {
                  throw new Error(
                    'No account was updated. The database may have rejected this operation.'
                  );
                }

                Alert.alert(
                  'Account updated',
                  `The account is now ${nextStatus}.`
                );

                await loadUsers();
              } catch (error) {
                console.error('Account status update failed:', error);
                Alert.alert(
                  'Update failed',
                  'The account was not confirmed as updated. Check the database permissions or profile protection rules, then try again.'
                );
              } finally {
                setBusyId(null);
              }
            })();
          },
        },
      ]
    );
  };

  const visibleUsers =
    filter === 'all'
      ? users
      : users.filter(user => user.role === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadUsers} />
        }
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Administrator dashboard</Text>
        </Pressable>

        <Text style={styles.brand}>MediBoa+</Text>
        <Text style={styles.title}>User management</Text>
        <Text style={styles.subtitle}>
          Manage real registered patient and professional accounts.
        </Text>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {users.filter(u => u.role === 'patient').length}
            </Text>
            <Text style={styles.metricLabel}>Patients</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {users.filter(u => u.role === 'professional').length}
            </Text>
            <Text style={styles.metricLabel}>Professionals</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {users.filter(u => u.account_status === 'active').length}
            </Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {([
            ['all', 'All'],
            ['patient', 'Patients'],
            ['professional', 'Professionals'],
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filter,
                filter === value && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === value && styles.filterTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading && users.length === 0 ? (
          <ActivityIndicator size="large" color={C.primary} />
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable onPress={() => void loadUsers()} style={styles.button}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !errorMessage && visibleUsers.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.name}>No accounts found</Text>
            <Text style={styles.muted}>
              There are no accounts matching the selected filter.
            </Text>
          </View>
        ) : null}

        {visibleUsers.map(user => (
          <View key={user.id} style={styles.card}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.name}>
                  {user.full_name?.trim() || 'Name not provided'}
                </Text>
                <Text style={styles.muted}>
                  {user.role === 'patient' ? 'Patient' : 'Healthcare professional'}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  user.account_status === 'active'
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <Text style={styles.badgeText}>{user.account_status}</Text>
              </View>
            </View>

            <Text style={styles.detail}>
              Phone: {user.phone?.trim() || 'Not provided'}
            </Text>
            <Text style={styles.detail}>
              Account ID: {user.id}
            </Text>

            <Pressable
              disabled={busyId === user.id}
              onPress={() => changeStatus(user)}
              style={[
                styles.button,
                user.account_status === 'active' && styles.deactivateButton,
                busyId === user.id && styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {busyId === user.id
                  ? 'Updating…'
                  : user.account_status === 'active'
                    ? 'Deactivate account'
                    : 'Activate account'}
              </Text>
            </Pressable>
          </View>
        ))}

        <Pressable onPress={() => void loadUsers()} style={styles.refresh}>
          <Text style={styles.refreshText}>Refresh accounts</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  content: { padding: 20, paddingBottom: 45 },
  back: { paddingVertical: 8, alignSelf: 'flex-start' },
  backText: { color: C.primary, fontWeight: '800' },
  brand: { color: C.primary, fontSize: 18, fontWeight: '900', marginTop: 12 },
  title: { color: C.text, fontSize: 28, fontWeight: '900', marginTop: 14 },
  subtitle: { color: C.muted, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  metrics: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  metric: {
    flex: 1, backgroundColor: C.white, padding: 13, borderRadius: 13,
    borderWidth: 1, borderColor: C.border,
  },
  metricValue: { fontSize: 23, fontWeight: '900', color: C.text },
  metricLabel: { fontSize: 11, color: C.muted, marginTop: 5 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  filter: {
    paddingVertical: 9, paddingHorizontal: 13, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.white,
  },
  filterActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { color: C.muted, fontWeight: '700', fontSize: 12 },
  filterTextActive: { color: C.white },
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 15,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userInfo: { flex: 1 },
  name: { color: C.text, fontSize: 15, fontWeight: '800' },
  muted: { color: C.muted, fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  activeBadge: { backgroundColor: '#DDF4E8' },
  inactiveBadge: { backgroundColor: '#FFF0D9' },
  badgeText: { color: C.text, fontSize: 10, fontWeight: '800' },
  detail: { color: C.muted, fontSize: 12, marginTop: 10 },
  button: {
    alignSelf: 'flex-start', marginTop: 13, paddingVertical: 10,
    paddingHorizontal: 15, backgroundColor: C.primary, borderRadius: 9,
  },
  deactivateButton: { backgroundColor: C.red },
  buttonText: { color: C.white, fontWeight: '800', fontSize: 12 },
  disabled: { opacity: 0.5 },
  errorBox: { backgroundColor: C.white, borderRadius: 12, padding: 15 },
  errorText: { color: C.red, lineHeight: 20 },
  refresh: { padding: 14, alignItems: 'center' },
  refreshText: { color: C.primary, fontWeight: '800' },
});
