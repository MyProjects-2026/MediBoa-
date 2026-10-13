import { router } from 'expo-router';
import { Alert } from 'react-native';
import { supabase } from './supabase';

export type MediBoaRole = 'patient' | 'professional' | 'admin';

export type MediBoaProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: MediBoaRole;
  account_status: 'active' | 'pending' | 'disabled';
};

export async function getCurrentProfile(): Promise<MediBoaProfile | null> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    return null;
  }

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, account_status')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (
    !['patient', 'professional', 'admin'].includes(data.role) ||
    !['active', 'pending', 'disabled'].includes(data.account_status)
  ) {
    return null;
  }

  return data as MediBoaProfile;
}

export async function requireRole(
  allowedRoles: MediBoaRole[]
): Promise<MediBoaProfile | null> {
  const profile = await getCurrentProfile();

  if (!profile) {
    Alert.alert(
      'Sign-in required',
      'Please sign in again to continue.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]
    );
    return null;
  }

  if (profile.account_status !== 'active') {
    await supabase.auth.signOut();

    Alert.alert(
      'Account unavailable',
      'This account is not currently authorized to access MediBoa+.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]
    );

    return null;
  }

  // Active administrators may open pages protected by any app role.
  // This grants page-level access only; Supabase RLS still governs database access.
  if (profile.role !== 'admin' && !allowedRoles.includes(profile.role)) {
    Alert.alert(
      'Access denied',
      'Your account is not authorized to open this area.'
    );
    return null;
  }

  return profile;
}

export async function signOutAndReturnHome(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    Alert.alert(
      'Sign-out failed',
      'We could not end your session. Please try again.'
    );
    return;
  }

  router.replace('/');
}
