import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { SecurityService } from '@/services/securityService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function LockScreen() {
    const { activeTheme } = useTheme();
    const colors = Colors[activeTheme];
    const [pin, setPin] = useState('');
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    useEffect(() => {
        loadSecurityQuestion();
    }, []);

    const loadSecurityQuestion = async () => {
        const q = await SecurityService.getSecurityQuestion();
        if (q) setSecurityQuestion(q);
    };

    const handlePress = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                validatePin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const validatePin = async (inputPin: string) => {
        const isValid = await SecurityService.validatePin(inputPin);
        if (isValid) {
            router.replace('/(tabs)');
        } else {
            setPin('');
            Alert.alert('Error', 'Incorrect PIN');
        }
    };

    const handleForgotPin = () => {
        setIsRecoveryMode(true);
    };

    const handleRecover = async () => {
        const isValid = await SecurityService.validateSecurityAnswer(securityAnswer);
        if (isValid) {
            Alert.alert('Success', 'Identity verified. Please set a new PIN in settings.');
            await SecurityService.disablePin(); // Temporarily disable to allow entry
            router.replace('/(tabs)');
        } else {
            Alert.alert('Error', 'Incorrect answer');
        }
    };

    if (isRecoveryMode) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <IconSymbol name="lock.open.fill" size={60} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>Recovery</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Answer your security question to reset PIN.
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.question, { color: colors.text }]}>{securityQuestion}</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Your Answer"
                            placeholderTextColor={colors.icon}
                            value={securityAnswer}
                            onChangeText={setSecurityAnswer}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleRecover}
                    >
                        <Text style={styles.buttonText}>Unlock App</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsRecoveryMode(false)}
                    >
                        <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <IconSymbol name="lock.fill" size={60} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>Enter PIN</Text>

                <View style={styles.dotsContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i < pin.length ? colors.primary : 'transparent',
                                    borderColor: colors.primary
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.keypad}>
                {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['forgot', '0', 'delete']
                ].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((key) => {
                            if (key === 'forgot') {
                                return (
                                    <TouchableOpacity key={key} style={styles.key} onPress={handleForgotPin}>
                                        <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot?</Text>
                                    </TouchableOpacity>
                                );
                            }
                            if (key === 'delete') {
                                return (
                                    <TouchableOpacity key={key} style={styles.key} onPress={handleDelete}>
                                        <IconSymbol name="delete.left.fill" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                );
                            }
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.key, { backgroundColor: colors.card }]}
                                    onPress={() => handlePress(key)}
                                >
                                    <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 50,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 20,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
    },
    keypad: {
        paddingHorizontal: 40,
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 20,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
