import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
];

export default function HelpScreen() {
    const { activeTheme } = useTheme();
    const colors = Colors[activeTheme];
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.back();
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentStep === steps.length - 1 ? 'Done' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        padding: 30,
        alignItems: 'center',
    },
    indicatorContainer: {
        flexDirection: 'row',
        marginBottom: 60,
        gap: 8,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
    },
    stepContainer: {
        alignItems: 'center',
        marginBottom: 60,
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
