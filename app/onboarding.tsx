import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const steps = [
    {
        title: 'Welcome to Budget AI',
        description: 'Your personal AI-powered finance tracker. Let\'s get your finances in order.',
        icon: 'sparkles',
        color: '#A78BFA',
    },
    {
        title: 'Track Expenses',
        description: 'Easily add income and expenses. Categorize them to see where your money goes.',
        icon: 'plus.circle.fill',
        color: '#4ADE80',
    },
    {
        title: 'Smart Insights',
        description: 'Get personalized financial advice and spending analysis powered by Gemini AI.',
        icon: 'chart.bar.fill',
        color: '#F472B6',
    },
    {
        title: 'Stay on Budget',
        description: 'Set monthly budgets for different categories and track your progress.',
        icon: 'target',
        color: '#60A5FA',
    },
    {
        title: 'Let\'s get to know you',
        description: 'What should we call you?',
        icon: 'person.fill',
        color: '#F59E0B',
        isInput: true,
    },
];

export default function OnboardingScreen() {
    const { activeTheme } = useTheme();
    const colors = Colors[activeTheme];
    const [currentStep, setCurrentStep] = useState(0);
    const [name, setName] = useState('');

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Finish onboarding
            try {
                if (name.trim()) {
                    await AsyncStorage.setItem('user_name', name.trim());
                }
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                router.replace('/(tabs)');
            } catch (e) {
                console.error('Failed to save onboarding data', e);
            }
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.indicatorContainer}>
                        {steps.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    {
                                        backgroundColor: index === currentStep ? colors.primary : colors.border,
                                        width: index === currentStep ? 24 : 8
                                    }
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.stepContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: currentStepData.color }]}>
                            <IconSymbol name={currentStepData.icon as any} size={60} color="#FFF" />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>{currentStepData.title}</Text>
                        <Text style={[styles.description, { color: colors.text }]}>{currentStepData.description}</Text>

                        {currentStepData.isInput && (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.card }]}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.icon}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: colors.primary },
                            currentStepData.isInput && !name.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleNext}
                        disabled={currentStepData.isInput && !name.trim()}
                    >
                        <Text style={styles.buttonText}>
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        padding: 30,
        alignItems: 'center',
    },
    indicatorContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        gap: 8,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
    },
    stepContainer: {
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        marginTop: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
