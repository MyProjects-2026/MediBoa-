import React from 'react';
import {
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
};

function InfoSection({
  icon,
  title,
  children,
  color,
}: {
  icon: string;
  title: string;
  children: string;
  color: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{children}</Text>
    </View>
  );
}

export default function AboutScreen() {
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
          <Text style={styles.topTitle}>About Us</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M+</Text>
          </View>
          <Text style={styles.brandName}>MediBoa+</Text>
          <Text style={styles.heroTitle}>Healthcare, made easier.</Text>
          <Text style={styles.heroDescription}>
            A digital healthcare platform designed to help people connect
            with healthcare services and manage their care journey.
          </Text>
        </View>

        <InfoSection
          icon="🎯"
          title="Our Mission"
          color={C.blue}
        >
          To make healthcare information and access to care more convenient
          by bringing patients and healthcare professionals together through
          a simple digital experience.
        </InfoSection>

        <InfoSection
          icon="🌍"
          title="Our Vision"
          color={C.green}
        >
          To contribute to a more connected, accessible, and patient-centred
          healthcare experience, beginning with the communities we serve.
        </InfoSection>

        <InfoSection
          icon="🤝"
          title="What We Do"
          color={C.purple}
        >
          MediBoa+ provides digital tools for patient access, appointment
          requests, healthcare professional workflows, and healthcare
          information. Available services depend on the features enabled
          in the platform.
        </InfoSection>

        <View style={styles.valuesCard}>
          <Text style={styles.sectionTitle}>What matters to us</Text>

          <View style={styles.valueRow}>
            <Text style={styles.valueIcon}>✓</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Accessibility</Text>
              <Text style={styles.valueDescription}>
                Making digital healthcare tools easier to navigate.
              </Text>
            </View>
          </View>

          <View style={styles.valueRow}>
            <Text style={styles.valueIcon}>✓</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Privacy</Text>
              <Text style={styles.valueDescription}>
                Treating personal and health information with care.
              </Text>
            </View>
          </View>

          <View style={styles.valueRow}>
            <Text style={styles.valueIcon}>✓</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Trust</Text>
              <Text style={styles.valueDescription}>
                Encouraging responsible use of healthcare information and
                professional services.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>An important note</Text>
          <Text style={styles.disclaimerText}>
            MediBoa+ is a digital platform, not a replacement for a qualified
            healthcare professional. If you need medical advice, consult an
            appropriate healthcare professional. For an emergency, seek
            immediate local emergency assistance.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/contact')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Contact MediBoa+ →</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/explore')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Explore Healthcare</Text>
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
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 10,
    marginBottom: 22,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: C.white,
    fontSize: 26,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 23,
    color: C.text,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '800',
    color: C.primary,
    marginTop: 13,
  },
  heroDescription: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 13,
    lineHeight: 22,
    marginTop: 9,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 19,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardDescription: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 22,
    marginTop: 8,
  },
  valuesCard: {
    backgroundColor: C.white,
    borderRadius: 19,
    padding: 20,
    marginTop: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 18,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 17,
  },
  valueIcon: {
    color: C.primary,
    backgroundColor: C.blue,
    overflow: 'hidden',
    width: 27,
    height: 27,
    lineHeight: 27,
    textAlign: 'center',
    borderRadius: 9,
    fontWeight: '900',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: '800',
  },
  valueDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4,
  },
  disclaimer: {
    backgroundColor: '#FFF3E5',
    padding: 17,
    borderRadius: 17,
    marginTop: 18,
    marginBottom: 20,
  },
  disclaimerTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: '900',
  },
  disclaimerText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 7,
  },
  primaryButton: {
    backgroundColor: C.primary,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 49,
    marginTop: 11,
    borderRadius: 14,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
  copyright: {
    color: C.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
});
