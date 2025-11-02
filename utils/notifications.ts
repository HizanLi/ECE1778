import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  try {
    // Cancel existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule new daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🗺️ GeoClaim',
        body: 'Go claim a new area today! The world awaits.',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log('Daily reminder scheduled');
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
}

export async function sendTerritoryAlert(territoryName: string, capturedBy: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Territory Lost!',
        body: `${capturedBy} has captured your territory near ${territoryName}!`,
        sound: true,
        data: { type: 'territory_lost', territoryName, capturedBy },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending territory alert:', error);
  }
}

export async function sendClaimSuccessNotification(area: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Territory Claimed!',
        body: `You've successfully claimed ${area.toFixed(0)}m² of territory!`,
        sound: true,
        data: { type: 'claim_success', area },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending claim success notification:', error);
  }
}

export function setupNotificationListener(handler: (notification: Notifications.Notification) => void) {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return subscription;
}

export function setupNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return subscription;
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
