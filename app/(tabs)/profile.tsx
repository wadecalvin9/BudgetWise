import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { cancelAllNotifications, registerForPushNotificationsAsync, scheduleDailyReminder } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Theme = 'light' | 'dark' | 'system';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'NGN' | 'KES';

const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
];

const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'gear' },
];

export default function ProfileScreen() {
    const { activeTheme, theme, setTheme, currency, setCurrency, currencySymbol } = useTheme();
    const colors = Colors[activeTheme];

    const [name, setName] = useState('John Doe');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        loadProfile();
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            const enabled = await AsyncStorage.getItem('notifications_enabled');
            const time = await AsyncStorage.getItem('reminder_time');

            if (enabled === 'true') setNotificationsEnabled(true);
            if (time) setReminderTime(new Date(time));
            else {
                // Default to 8:00 PM
                const defaultTime = new Date();
                defaultTime.setHours(20, 0, 0, 0);
                setReminderTime(defaultTime);
            }
        } catch (e) {
            console.error('Failed to load notification settings', e);
        }
    };

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const granted = await registerForPushNotificationsAsync();
            if (!granted) {
                Alert.alert('Permission Denied', 'Please enable notifications in your device settings to use this feature.');
                setNotificationsEnabled(false);
                return;
            }
            await scheduleDailyReminder(reminderTime.getHours(), reminderTime.getMinutes());
        } else {
            await cancelAllNotifications();
        }
        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notifications_enabled', String(value));
    };

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);

        if (selectedDate) {
            setReminderTime(selectedDate);
            await AsyncStorage.setItem('reminder_time', selectedDate.toISOString());

            if (notificationsEnabled) {
                await scheduleDailyReminder(selectedDate.getHours(), selectedDate.getMinutes());
            }
        }
    };

    const loadProfile = async () => {
        try {
            const savedName = await AsyncStorage.getItem('user_name');
            const savedAvatar = await AsyncStorage.getItem('user_avatar');
            if (savedName) setName(savedName);
            if (savedAvatar) setAvatar(savedAvatar);
        } catch (e) {
            console.error('Failed to load profile', e);
        }
    };

    const saveProfile = async (newName: string) => {
        try {
            await AsyncStorage.setItem('user_name', newName);
            setName(newName);
            setIsEditingName(false);
        } catch (e) {
            console.error('Failed to save profile', e);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            await AsyncStorage.setItem('user_avatar', uri);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

                {/* Profile Section */}
                <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarInitials}>{name.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                            <IconSymbol name="pencil" size={12} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.profileInfo}>
                        {isEditingName ? (
                            <View style={styles.nameEditContainer}>
                                <TextInput
                                    style={[styles.nameInput, { color: colors.text, borderColor: colors.primary }]}
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                    onBlur={() => saveProfile(name)}
                                    onSubmitEditing={() => saveProfile(name)}
                                />
                                <TouchableOpacity onPress={() => saveProfile(name)}>
                                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameContainer}>
                                <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
                                <IconSymbol name="pencil" size={16} color={colors.icon} />
                            </TouchableOpacity>
                        )}
                        <Text style={[styles.profileSubtitle, { color: colors.icon }]}>Tap to edit profile</Text>
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>APPEARANCE</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        {themes.map((t, index) => (
                            <TouchableOpacity
                                key={t.value}
                                style={[
                                    styles.row,
                                    index < themes.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
                                ]}
                                onPress={() => setTheme(t.value)}
                            >
                                <View style={styles.rowContent}>
                                    <View style={[styles.iconContainer, { backgroundColor: theme === t.value ? colors.primary + '20' : 'transparent' }]}>
                                        <IconSymbol
                                            name={t.icon as any}
                                            size={20}
                                            color={theme === t.value ? colors.primary : colors.icon}
                                        />
                                    </View>
                                    <Text style={[styles.rowLabel, { color: colors.text, fontWeight: theme === t.value ? '600' : '400' }]}>
                                        {t.label}
                                    </Text>
                                </View>
                                {theme === t.value && (
                                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>NOTIFICATIONS</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <View style={styles.row}>
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: notificationsEnabled ? colors.primary + '20' : 'transparent' }]}>
                                    <IconSymbol name="bell.fill" size={20} color={notificationsEnabled ? colors.primary : colors.icon} />
                                </View>
                                <View>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Daily Reminder</Text>
                                    {notificationsEnabled && (
                                        <Text style={[styles.rowSubtitle, { color: colors.icon }]}>
                                            {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: colors.icon + '40', true: colors.primary }}
                                thumbColor={'#FFF'}
                            />
                        </View>

                        {notificationsEnabled && (
                            <View style={[styles.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder Time</Text>
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={reminderTime}
                                        mode="time"
                                        display="compact"
                                        onChange={handleTimeChange}
                                        themeVariant={activeTheme === 'dark' ? 'dark' : 'light'}
                                    />
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setShowTimePicker(true)}
                                            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.background, borderRadius: 8 }}
                                        >
                                            <Text style={{ color: colors.primary, fontWeight: '600' }}>
                                                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </TouchableOpacity>
                                        {showTimePicker && (
                                            <DateTimePicker
                                                value={reminderTime}
                                                mode="time"
                                                display="default"
                                                onChange={handleTimeChange}
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* Currency Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>CURRENCY</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        {currencies.map((c, index) => (
                            <TouchableOpacity
                                key={c.code}
                                style={[
                                    styles.row,
                                    index < currencies.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
                                ]}
                                onPress={() => setCurrency(c.code)}
                            >
                                <View style={styles.rowContent}>
                                    <View style={[styles.currencyBadge, { backgroundColor: currency === c.code ? colors.primary : colors.border }]}>
                                        <Text style={[styles.currencySymbolText, { color: currency === c.code ? '#FFF' : colors.text }]}>
                                            {c.symbol}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.rowLabel, { color: colors.text, fontWeight: currency === c.code ? '600' : '400' }]}>
                                            {c.name}
                                        </Text>
                                        <Text style={[styles.rowSubtitle, { color: colors.icon }]}>{c.code}</Text>
                                    </View>
                                </View>
                                {currency === c.code && (
                                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>ABOUT</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <TouchableOpacity
                            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                            onPress={() => router.push('/security')}
                        >
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="lock.fill" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Security</Text>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                            onPress={() => router.push('/export')}
                        >
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="tray" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Export Data</Text>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                            onPress={() => router.push('/help')}
                        >
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Help & Guide</Text>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => router.push('/credits')}
                        >
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Credits</Text>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.versionText, { color: colors.icon }]}>Version 1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    profileCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    profileInfo: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
    },
    nameEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    nameInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        borderBottomWidth: 2,
        paddingVertical: 0,
    },
    profileSubtitle: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 12,
        letterSpacing: 0.5,
    },
    sectionContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    currencyBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbolText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 13,
        marginBottom: 20,
    },
});
