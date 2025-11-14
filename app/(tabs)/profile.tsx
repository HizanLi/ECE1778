import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';
import { scheduleDailyReminder, cancelAllNotifications } from '../../utils/notifications';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { state, setGameMode, updateSettings } = useGame();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.user_name || '');
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ user_name: username.trim() });
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUsername(user?.user_name || '');
    setEditing(false);
  };

  const toggleGameMode = async () => {
    const newMode = state.gameMode === 'competitive' ? 'simulation' : 'competitive';
    await setGameMode(newMode);
  };

  const toggleDailyReminder = async (enabled: boolean) => {
    const newSettings = {
      ...state.settings,
      notifications: {
        ...state.settings.notifications,
        daily_reminder: enabled,
      },
    };
    await updateSettings(newSettings);

    if (enabled) {
      const [hour, minute] = state.settings.notifications.reminder_time.split(':');
      await scheduleDailyReminder(parseInt(hour), parseInt(minute));
    } else {
      await cancelAllNotifications();
    }
  };

  const toggleTerritoryAlerts = async (enabled: boolean) => {
    const newSettings = {
      ...state.settings,
      notifications: {
        ...state.settings.notifications,
        territory_alerts: enabled,
      },
    };
    await updateSettings(newSettings);
  };

  if (!user) {
    return (
      <View style={globalStyles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.user_name.charAt(0).toUpperCase()}</Text>
        </View>
        {editing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              maxLength={30}
            />
            <View style={styles.editButtons}>
              <Button
                title="Cancel"
                onPress={handleCancelEdit}
                variant="secondary"
                style={styles.editButton}
              />
              <Button
                title="Save"
                onPress={handleSaveProfile}
                loading={saving}
                style={styles.editButton}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.username}>{user.user_name}</Text>
            <Button
              title="Edit Name"
              onPress={() => setEditing(true)}
              variant="secondary"
              style={styles.editNameButton}
            />
          </>
        )}
        <Text style={styles.email}>{user.user_email}</Text>
      </View>

      <View style={globalStyles.statsContainer}>
        <View style={globalStyles.statItem}>
          <Text style={globalStyles.statValue}>
            {(user.total_area / 1000000).toFixed(2)}
          </Text>
          <Text style={globalStyles.statLabel}>km² claimed</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Game Mode</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {state.gameMode === 'competitive' ? '⚔️ Competitive' : '🧪 Simulation'}
            </Text>
            <Text style={styles.settingDescription}>
              {state.gameMode === 'competitive'
                ? 'Capture territory from other players'
                : 'Practice mode without competition'}
            </Text>
          </View>
          <Switch
            value={state.gameMode === 'competitive'}
            onValueChange={toggleGameMode}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminded to play at {state.settings.notifications.reminder_time}
            </Text>
          </View>
          <Switch
            value={state.settings.notifications.daily_reminder}
            onValueChange={toggleDailyReminder}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={[styles.settingRow, styles.settingRowLast]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Territory Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified when your territory is captured
            </Text>
          </View>
          <Switch
            value={state.settings.notifications.territory_alerts}
            onValueChange={toggleTerritoryAlerts}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          loading={signingOut}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  usernameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '80%',
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    flex: 1,
    minWidth: 100,
  },
  editNameButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footer: {
    padding: 16,
    marginBottom: 32,
  },
});
