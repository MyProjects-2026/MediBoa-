import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#F4F8FA',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="patient-login" />
        <Stack.Screen name="patient-register" />
        <Stack.Screen name="patient-dashboard" />
        <Stack.Screen name="professional-login" />
        <Stack.Screen name="professional-dashboard" />
        <Stack.Screen name="appointments" />
        <Stack.Screen name="admin-dashboard" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="about" />
      </Stack>
    </ThemeProvider>
  );
}
