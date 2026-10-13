import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';

const COLORS = {
  primary: '#087F8C',
  primaryDark: '#066672',
  background: '#F4F8FB',
  white: '#FFFFFF',
  text: '#173042',
  muted: '#708596',
  border: '#E3ECF2',
  lightBlue: '#E7F5F8',
  green: '#E8F7F0',
  purple: '#F0EDFF',
};

type AccessCardProps = {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  background: string;
};

function AccessCard({
  icon,
  title,
  description,
  buttonText,
  onPress,
  background,
}: AccessCardProps) {
  return (
    <View style={styles.accessCard}>
      <View style={[styles.cardIcon, { backgroundColor: background }]}>
        <Text style={styles.cardIconText}>{icon}</Text>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>

      <Text style={styles.cardDescription}>{description}</Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
        style={({ pressed }) => [
          styles.cardButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.cardButtonText}>{buttonText}</Text>
        <Text style={styles.buttonArrow}>→</Text>
      </Pressable>
    </View>
  );
}

function ServiceItem({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.serviceItem,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.serviceIcon}>
        <Text style={styles.serviceEmoji}>{icon}</Text>
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M+</Text>
            </View>

            <View>
              <Text style={styles.brandName}>MediBoa+</Text>
              <Text style={styles.brandTagline}>HEALTHCARE, MADE EASIER</Text>
            </View>
          </View>

          <View style={styles.languageBadge}>
            <Text style={styles.languageText}>EN</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.eyebrow}>
            <View style={styles.statusDot} />
            <Text style={styles.eyebrowText}>YOUR HEALTH, OUR PRIORITY</Text>
          </View>

          <Text style={styles.heroTitle}>
            Better care.{'\n'}
            <Text style={styles.heroAccent}>Better living.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Connect with healthcare professionals and discover services to
            help you take care of your health.
          </Text>

          <View style={styles.heroIllustration}>
            <View style={styles.circleOuter}>
              <View style={styles.circleInner}>
                <Text style={styles.heartIcon}>✚</Text>
              </View>
            </View>

            <View style={styles.floatingBadge}>
              <Text style={styles.floatingBadgeIcon}>♥</Text>
              <View>
                <Text style={styles.floatingBadgeTitle}>Care starts here</Text>
                <Text style={styles.floatingBadgeSubtitle}>
                  Your health matters
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Welcome to MediBoa+</Text>
            <Text style={styles.sectionSubtitle}>
              Choose how you want to continue.
            </Text>
          </View>
        </View>

        <AccessCard
          icon="👤"
          title="I'm a Patient"
          description="Find healthcare services, discover doctors, and manage your appointments."
          buttonText="Continue as Patient"
          background={COLORS.lightBlue}
          onPress={() => router.push('/patient-login')}
        />

        <AccessCard
          icon="🩺"
          title="I'm a Healthcare Professional"
          description="Access your professional workspace and manage your daily activities."
          buttonText="Professional Access"
          background={COLORS.green}
          onPress={() => router.push('/professional-login')}
        />

        <AccessCard
          icon="🛡️"
          title="Administrator"
          description="Access your MediBoa+ administration dashboard and manage the platform."
          buttonText="Admin Access"
          background={COLORS.purple}
          onPress={() => router.push('/patient-login')}
        />

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Explore healthcare</Text>
          <Text style={styles.sectionSubtitle}>
            Your journey to better care starts here.
          </Text>

          <View style={styles.servicesGrid}>
            <ServiceItem
              icon="🩺"
              title="Find a doctor"
              onPress={() => router.push('/explore')}
            />
            <ServiceItem
              icon="📅"
              title="Appointments"
              onPress={() => router.push('/patient-login')}
            />
            <ServiceItem
              icon="🏥"
              title="Health facilities"
              onPress={() => router.push('/explore')}
            />
            <ServiceItem
              icon="💊"
              title="Pharmacy services"
              onPress={() => router.push('/explore')}
            />
          </View>
        </View>

        <View style={styles.trustBanner}>
          <View style={styles.trustIcon}>
            <Text style={styles.trustIconText}>✓</Text>
          </View>

          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Care with confidence</Text>
            <Text style={styles.trustDescription}>
              Your healthcare information deserves privacy and protection.
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 22,
            marginTop: 28,
            marginBottom: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/explore')}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>
              Explore Healthcare
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/about')}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>
              About Us
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/contact')}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>
              Contact Us
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>MediBoa+</Text>
          <Text style={styles.footerText}>
            Healthcare access, made simpler.
          </Text>
          <Text style={styles.copyright}>© MediBoa+ 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  header: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -1,
  },

  brandName: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  brandTagline: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 3,
  },

  languageBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  languageText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  hero: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 22,
    paddingBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#24A879',
  },

  eyebrowText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: COLORS.primary,
  },

  heroTitle: {
    marginTop: 18,
    fontSize: 35,
    lineHeight: 42,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1.3,
  },

  heroAccent: {
    color: COLORS.primary,
  },

  heroDescription: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 310,
  },

  heroIllustration: {
    height: 125,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#E6F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleInner: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },

  heartIcon: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '700',
  },

  floatingBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  floatingBadgeIcon: {
    color: '#E45F79',
    fontSize: 20,
  },

  floatingBadgeTitle: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },

  floatingBadgeSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 17,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 27,
    color: COLORS.text,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  sectionSubtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  accessCard: {
    padding: 19,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  cardIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  cardIconText: {
    fontSize: 24,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
  },

  cardDescription: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  cardButton: {
    marginTop: 17,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '500',
  },

  pressed: {
    opacity: 0.78,
  },

  servicesSection: {
    marginTop: 23,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },

  serviceItem: {
    width: '48%',
    minHeight: 112,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    justifyContent: 'center',
  },

  serviceIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  serviceEmoji: {
    fontSize: 19,
  },

  serviceTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  trustBanner: {
    marginTop: 25,
    padding: 16,
    backgroundColor: '#EAF7F1',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  trustIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#D0F0E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trustIconText: {
    color: '#17885C',
    fontSize: 19,
    fontWeight: '800',
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  trustDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerBrand: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  copyright: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 14,
  },
});