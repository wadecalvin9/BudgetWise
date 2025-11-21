import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { SecurityService } from '@/services/securityService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SecuritySettingsScreen() {
    const { activeTheme } = useTheme();
    const colors = Colors[activeTheme];

    const [isPinEnabled, setIsPinEnabled] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkStatus();
        }, [])
    );

    const checkStatus = async () => {
        const enabled = await SecurityService.isPinEnabled();
        setIsPinEnabled(enabled);
    };

    const handleTogglePin = async (value: boolean) => {
        if (value) {
            setIsSettingUp(true);
        } else {
            await SecurityService.disablePin();
            setIsPinEnabled(false);
        }
    };

    const handleSave = async () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'PIN must be 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            Alert.alert('Error', 'PINs do not match');
            return;
        }
        if (!question.trim() || !answer.trim()) {
            Alert.alert('Error', 'Please set a security question and answer');
            return;
        }

        await SecurityService.setPin(pin);
        await SecurityService.setSecurityQuestion(question, answer);
        setIsPinEnabled(true);
        setIsSettingUp(false);
        Alert.alert('Success', 'Security enabled successfully');
        router.back();
    };

    if (isSettingUp) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: colors.background }]}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setIsSettingUp(false)} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Setup Security</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Set PIN</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Enter 4-digit PIN"
                            placeholderTextColor={colors.icon}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            value={pin}
                            onChangeText={setPin}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Confirm PIN"
                            placeholderTextColor={colors.icon}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            value={confirmPin}
                            onChangeText={setConfirmPin}
                        />
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recovery Question</Text>
                        <Text style={[styles.helperText, { color: colors.icon }]}>
                            Used to reset your PIN if you forget it.
                        </Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Question (e.g., First pet's name?)"
                            placeholderTextColor={colors.icon}
                            value={question}
                            onChangeText={setQuestion}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Answer"
                            placeholderTextColor={colors.icon}
                            value={answer}
                            onChangeText={setAnswer}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>Save Security Settings</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.optionCard, { backgroundColor: colors.card }]}>
                    <View style={styles.optionInfo}>
                        <IconSymbol name="lock.fill" size={24} color={colors.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>App Lock</Text>
                            <Text style={[styles.optionDescription, { color: colors.icon }]}>
                                Require PIN to open app
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={isPinEnabled}
                        onValueChange={handleTogglePin}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#FFF"
                    />
                </View>
            </View>
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
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    helperText: {
        fontSize: 14,
        marginBottom: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    optionDescription: {
        fontSize: 14,
        marginTop: 4,
    },
});
