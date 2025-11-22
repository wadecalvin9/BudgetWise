import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            return false;
        }
        return true;
    } else {
        // alert('Must use physical device for Push Notifications');
        return false;
    }
}

export async function scheduleDailyReminder(hour: number, minute: number) {
    await cancelAllNotifications();

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Don't forget to log your expenses! 📝",
            body: "Take a moment to track your spending for today.",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hour,
            minute: minute,
        },
    });
    return identifier;
}

export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}
