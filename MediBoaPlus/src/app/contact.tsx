import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MEDIBOA_CONTACT } from '@/constants/mediboa-contact';

const C = {
  primary: '#087F8C',
  dark: '#066672',
  background: '#F4F8FB',
  white: '#FFFFFF',
  text: '#173042',
  muted: '#708596',
  border: '#E3ECF2',
  blue: '#E7F5F8',
  green: '#E8F7F0',
  purple: '#F0EDFF',
  orange: '#FFF3E5',
};

type ContactPerson = {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
};

async function openContactUrl(url: string, label: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Unable to open',
      `We could not open ${label}. Please make sure a suitable application is installed and try again.`
    );
  }
}

function ContactAction({
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
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionIconBox, { backgroundColor: color }]}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>

      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function ContactPersonCard({
  person,
}: {
  person: ContactPerson;
}) {
  const digits = person.whatsapp.replace(/\D/g, '');
  const phone = person.phone.trim();
  const email = person.email.trim();

  const whatsapp = () => {
    if (!digits) {
      Alert.alert('Unavailable', 'The WhatsApp number is not configured.');
      return;
    }

    void openContactUrl(`https://wa.me/${digits}`, 'WhatsApp');
  };

  const call = () => {
    if (!phone) {
      Alert.alert('Unavailable', 'The phone number is not configured.');
      return;
    }

    void openContactUrl(`tel:${phone.replace(/\s/g, '')}`, 'the phone dialler');
  };

  const sms = () => {
    if (!phone) {
      Alert.alert('Unavailable', 'The SMS number is not configured.');
      return;
    }

    void openContactUrl(`sms:${phone.replace(/\s/g, '')}`, 'SMS');
  };

  const sendEmail = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Unavailable', 'A valid email address is not configured.');
      return;
    }

    void openContactUrl(
      `mailto:${email}?subject=${encodeURIComponent('MediBoa+ Enquiry')}`,
      'your email application',
    );
  };

  return (
    <View style={styles.personCard}>
      <View style={styles.personHeader}>
        <View style={styles.personAvatar}>
          <Text style={styles.personAvatarText}>
            {person.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('')}
          </Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personRole}>{person.role}</Text>
          <View style={styles.regionBadge}>
            <Text style={styles.regionBadgeText}>
              Mozambique
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.contactDetailLabel}>PHONE NUMBER</Text>
      <Text style={styles.contactDetailValue}>{person.phone}</Text>

      <Text style={[styles.contactDetailLabel, styles.emailLabel]}>
        EMAIL ADDRESS
      </Text>
      <Text style={styles.contactDetailValue}>{person.email}</Text>

      <View style={styles.actionGrid}>
        <ContactAction
          icon="🟢"
          title="WhatsApp"
          description="Send a message"
          color={C.green}
          onPress={whatsapp}
        />

        <ContactAction
          icon="📞"
          title="Call"
          description="Call this contact"
          color={C.blue}
          onPress={call}
        />

        <ContactAction
          icon="✉️"
          title="SMS"
          description="Send a text"
          color={C.purple}
          onPress={sms}
        />

        <ContactAction
          icon="📧"
          title="Email"
          description="Write an email"
          color={C.orange}
          onPress={sendEmail}
        />
      </View>
    </View>
  );
}

export default function ContactScreen() {
  const doctor = MEDIBOA_CONTACT.doctor;
  const administrator = MEDIBOA_CONTACT.administrator;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>Contact Us</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIconBox}>
            <Text style={styles.heroIcon}>💬</Text>
          </View>

          <Text style={styles.heroTitle}>We're here to help.</Text>

          <Text style={styles.heroDescription}>
            Contact the MediBoa+ medical or administration team.
            Choose the person you need and your preferred way to
            get in touch.
          </Text>

          <View style={styles.locationBadge}>
            <Text style={styles.locationBadgeText}>
              📍 Mozambique
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Medical Contact</Text>
        <Text style={styles.sectionSubtitle}>
          For medical-service enquiries.
        </Text>

        <ContactPersonCard
          person={{
            name: `${doctor.title} ${doctor.name}`,
            role: doctor.role,
            phone: doctor.phone,
            whatsapp: doctor.whatsapp,
            email: doctor.email,
          }}
        />

        <Text style={styles.sectionTitle}>
          Administration & Support
        </Text>
        <Text style={styles.sectionSubtitle}>
          For app support, technical questions, and general enquiries.
        </Text>

        <ContactPersonCard
          person={{
            name: `${administrator.title} ${administrator.name}`,
            role: administrator.role,
            phone: administrator.phone,
            whatsapp: administrator.whatsapp,
            email: administrator.email,
          }}
        />

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>MediBoa+</Text>
          <Text style={styles.detailsText}>
            Healthcare access, made simpler.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Region</Text>
          <Text style={styles.value}>{MEDIBOA_CONTACT.region}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/about')}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            Learn About MediBoa+
          </Text>
        </Pressable>

        <Text style={styles.copyright}>© MediBoa+ 2026</Text>
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
    paddingBottom: 36,
  },
  topBar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  backText: {
    fontSize: 34,
    lineHeight: 38,
    color: C.text,
  },
  topTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
  },
  hero: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 26,
  },
  heroTitle: {
    color: C.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroDescription: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  locationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 18,
  },
  locationBadgeText: {
    color: C.dark,
    fontWeight: '800',
    fontSize: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  personCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#173042',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  personAvatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    color: C.dark,
    fontSize: 19,
    fontWeight: '900',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    color: C.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 23,
  },
  personRole: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  regionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.green,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 7,
  },
  regionBadgeText: {
    color: '#217653',
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 18,
  },
  contactDetailLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },
  contactDetailValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    flexWrap: 'wrap',
  },
  emailLabel: {
    marginTop: 15,
  },
  actionGrid: {
    marginTop: 20,
    gap: 10,
  },
  actionCard: {
    minHeight: 66,
    backgroundColor: '#FAFCFD',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 19,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: '800',
  },
  actionDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  arrow: {
    fontSize: 26,
    color: C.muted,
  },
  detailsCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
  },
  detailsTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '900',
  },
  detailsText: {
    color: C.muted,
    fontSize: 13,
    marginTop: 5,
  },
  label: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  value: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: C.blue,
    borderWidth: 1,
    borderColor: '#C8E9ED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '900',
  },
  copyright: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 11,
    marginTop: 24,
  },
});
