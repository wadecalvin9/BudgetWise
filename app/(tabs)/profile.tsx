import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    useEffect(() => {
        loadProfile();
    }, []);

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
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
                        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
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

                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
                    <View style={styles.optionsContainer}>
                        {themes.map((t) => (
                            <TouchableOpacity
                                key={t.value}
                                style={[
                                    styles.optionCard,
                                    { backgroundColor: colors.card },
                                    theme === t.value && { borderColor: colors.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setTheme(t.value)}
                            >
                                <View style={styles.optionContent}>
                                    <Text style={[styles.optionLabel, { color: colors.text }]}>{t.label}</Text>
                                    {theme === t.value && (
                                        <IconSymbol name="checkmark" size={20} color={colors.primary} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Currency Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Currency</Text>
                    <View style={styles.optionsContainer}>
                        {currencies.map((c) => (
                            <TouchableOpacity
                                key={c.code}
                                style={[
                                    styles.currencyCard,
                                    { backgroundColor: colors.card },
                                    currency === c.code && { borderColor: colors.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setCurrency(c.code)}
                            >
                                <View style={styles.currencyContent}>
                                    <View>
                                        <Text style={[styles.currencySymbol, { color: colors.text }]}>{c.symbol}</Text>
                                        <Text style={[styles.currencyCode, { color: colors.icon }]}>{c.code}</Text>
                                    </View>
                                    <Text style={[styles.currencyName, { color: colors.text }]}>{c.name}</Text>
                                    {currency === c.code && (
                                        <IconSymbol name="checkmark" size={20} color={colors.primary} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* About & Help Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.card }]}
                            onPress={() => router.push('/security')}
                        >
                            <View style={styles.optionContent}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <IconSymbol name="lock.fill" size={24} color={colors.primary} />
                                    <Text style={[styles.optionLabel, { color: colors.text }]}>Security</Text>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.card }]}
                            onPress={() => router.push('/help')}
                        >
                            <View style={styles.optionContent}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <IconSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
                                    <Text style={[styles.optionLabel, { color: colors.text }]}>Help & Guide</Text>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.card }]}
                            onPress={() => router.push('/credits')}
                        >
                            <View style={styles.optionContent}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
                                    <Text style={[styles.optionLabel, { color: colors.text }]}>Credits</Text>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Current Settings Display */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.infoTitle, { color: colors.icon }]}>Current Settings</Text>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        Theme: <Text style={{ fontWeight: 'bold' }}>{theme}</Text> (Active: {activeTheme})
                    </Text>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        Currency: <Text style={{ fontWeight: 'bold' }}>{currency} ({currencySymbol})</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 120,
    },
    header: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    profileCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#FFF',
        fontSize: 32,
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
        borderColor: '#FFF',
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    nameEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    nameInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        paddingVertical: 0,
    },
    profileSubtitle: {
        fontSize: 14,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    currencyCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    currencyContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    currencyCode: {
        fontSize: 12,
        marginTop: 2,
    },
    currencyName: {
        fontSize: 16,
        flex: 1,
        marginLeft: 16,
    },
    infoCard: {
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 14,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 8,
    },
});
