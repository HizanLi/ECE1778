import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';
import { Button } from '../../components/Button';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';
import { requestNotificationPermissions } from '../../utils/notifications';

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { requestPermissions } = useLocation();

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      // Request location permissions
      const locationGranted = await requestPermissions();
      if (!locationGranted) {
        Alert.alert(
          'Location Required',
          'GeoClaim needs location access to track your movement and claim territories. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Request notification permissions
      const notifGranted = await requestNotificationPermissions();
      if (!notifGranted) {
        Alert.alert(
          'Notifications Recommended',
          'Enable notifications to receive alerts when your territory is captured and daily reminders to play.',
          [
            { text: 'Skip', style: 'cancel', onPress: () => router.replace('/(tabs)') },
            { text: 'Enable', onPress: () => router.replace('/(tabs)') },
          ]
        );
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🗺️</Text>
          <Text style={styles.title}>Welcome to GeoClaim!</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>Track Your Movement</Text>
            <Text style={styles.featureText}>
              Walk or run in the real world to draw trails and claim territories
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureTitle}>Compete for Territory</Text>
            <Text style={styles.featureText}>
              Capture areas from other players and defend your claimed zones
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureTitle}>Stay Updated</Text>
            <Text style={styles.featureText}>
              Get notifications when your territory is captured or nearby activity happens
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Get Started" onPress={handleGetStarted} loading={loading} />
          <Text style={styles.note}>
            We'll need location and notification permissions to provide the best experience
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  feature: {
    marginBottom: 32,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  footer: {
    marginBottom: 20,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
