import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreditsScreen() {
    const { activeTheme } = useTheme();
    const colors = Colors[activeTheme];

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Credits</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                        <IconSymbol name="sparkles" size={40} color="#FFF" />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>BudgetWise</Text>
                    <Text style={[styles.version, { color: colors.icon }]}>Version 1.0.0</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Developer</Text>
                    <Text style={[styles.devName, { color: colors.text }]}>Calvin</Text>
                    <Text style={[styles.devRole, { color: colors.icon }]}>Lead Developer & Designer</Text>

                    <Text style={[styles.description, { color: colors.text }]}>
                        Built with passion to help you manage your finances smarter using the power of AI.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Connect</Text>

                    <TouchableOpacity
                        style={styles.socialRow}
                        onPress={() => openLink('https://www.instagram.com/ph4nt0m_._?igsh=ZHVjd3NsbHZoM2dy')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#E1306C' }]}>
                            <IconSymbol name="camera.fill" size={20} color="#FFF" />
                        </View>
                        <Text style={[styles.socialText, { color: colors.text }]}>Follow on Instagram</Text>
                        <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: colors.background }]} />

                    <TouchableOpacity
                        style={styles.socialRow}
                        onPress={() => openLink('https://twitter.com/')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#1DA1F2' }]}>
                            <IconSymbol name="bubble.left.fill" size={20} color="#FFF" />
                        </View>
                        <Text style={[styles.socialText, { color: colors.text }]}>Follow on X (Twitter)</Text>
                        <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: colors.background }]} />

                    <TouchableOpacity
                        style={styles.socialRow}
                        onPress={() => openLink('https://github.com/wadecalvin9')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
                            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="#FFF" />
                        </View>
                        <Text style={[styles.socialText, { color: colors.text }]}>View on GitHub</Text>
                        <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.footer, { color: colors.icon }]}>
                    © 2025 Budget Tracker AI. All rights reserved.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    version: {
        fontSize: 14,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    devName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    devRole: {
        fontSize: 14,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    socialText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        width: '100%',
    },
    footer: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40,
    },
});
