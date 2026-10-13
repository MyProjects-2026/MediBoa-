import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

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

type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
  action: string;
  color: string;
  onPress: () => void;
};

function ServiceCard({
  icon,
  title,
  description,
  action,
  color,
  onPress,
}: ServiceCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.cardButtonText}>{action}</Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    </View>
  );
}

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

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

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M+</Text>
            </View>
            <Text style={styles.brandName}>MediBoa+</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.eyebrow}>
            <View style={styles.dot} />
            <Text style={styles.eyebrowText}>YOUR HEALTH MATTERS</Text>
          </View>

          <Text style={styles.heroTitle}>Explore Healthcare</Text>

          <Text style={styles.heroDescription}>
            Your journey to better care starts here.
          </Text>

          <Text style={styles.heroSupporting}>
            Explore healthcare options and find the information you need to
            take your next step.
          </Text>

          <View style={styles.heroIcon}>
            <Text style={styles.heroPlus}>✚</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Healthcare services</Text>
          <Text style={styles.sectionSubtitle}>
            What would you like to explore today?
          </Text>
        </View>

        <ServiceCard
          icon="🩺"
          title="Find a Doctor"
          description="Explore professional care and get started with an appointment request."
          action="Find care"
          color={C.blue}
          onPress={() => router.push('/patient-login')}
        />

        <ServiceCard
          icon="🏥"
          title="Health Facilities"
          description="Learn about healthcare facilities and find information to help plan your care."
          action="Explore facilities"
          color={C.green}
          onPress={() =>
            Alert.alert(
              'Health Facilities',
              'The facility directory will be available when verified facility listings are connected to MediBoa+.',
              [{ text: 'OK' }, { text: 'Contact Us', onPress: () => router.push('/contact') }]
            )
          }
        />

        <ServiceCard
          icon="💊"
          title="Pharmacy Services"
          description="Find out more about pharmacy services and accessing medication support."
          action="Explore services"
          color={C.purple}
          onPress={() =>
            Alert.alert(
              'Pharmacy Services',
              'The pharmacy directory will be available when verified pharmacy listings are connected to MediBoa+.',
              [{ text: 'OK' }, { text: 'Contact Us', onPress: () => router.push('/contact') }]
            )
          }
        />

        <ServiceCard
          icon="📅"
          title="Appointments"
          description="Access the appointment workflow to request or manage healthcare visits."
          action="Continue"
          color={C.orange}
          onPress={() => router.push('/patient-login')}
        />

        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>🛡️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your privacy matters</Text>
            <Text style={styles.infoDescription}>
              Protect your account credentials and only share personal health
              information through appropriate, trusted channels.
            </Text>
          </View>
        </View>

        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/about')}>
            <Text style={styles.footerLink}>About MediBoa+</Text>
          </Pressable>

          <Text style={styles.separator}>•</Text>

          <Pressable onPress={() => router.push('/contact')}>
            <Text style={styles.footerLink}>Contact Us</Text>
          </Pressable>
        </View>

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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
  },
  brandName: {
    color: C.text,
    fontSize: 19,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: C.white,
    borderRadius: 25,
    padding: 22,
    marginTop: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#21A675',
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: C.primary,
  },
  heroTitle: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    color: C.text,
    marginBottom: 9,
  },
  heroDescription: {
    fontSize: 17,
    lineHeight: 25,
    color: C.primary,
    fontWeight: '700',
  },
  heroSupporting: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
    paddingRight: 15,
  },
  heroIcon: {
    position: 'absolute',
    right: -12,
    bottom: -18,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlus: {
    color: C.primary,
    fontSize: 45,
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: C.text,
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 19,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 27,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: C.muted,
    marginTop: 7,
  },
  cardButton: {
    marginTop: 16,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: C.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardButtonText: {
    color: C.dark,
    fontSize: 13,
    fontWeight: '800',
  },
  arrow: {
    color: C.dark,
    fontSize: 19,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: C.green,
    padding: 17,
    borderRadius: 18,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  infoDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    marginTop: 27,
  },
  footerLink: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  separator: {
    color: C.muted,
  },
  copyright: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 11,
    marginTop: 17,
  },
});
