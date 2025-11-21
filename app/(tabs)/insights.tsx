import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getFinancialInsights } from '@/services/ai';
import { getTransactions } from '@/services/transactionService';

export default function InsightsScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];

    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);

    const generateInsights = async () => {
        setLoading(true);
        try {
            const transactions = await getTransactions(db);
            const insightText = await getFinancialInsights(transactions, currencySymbol);
            setInsights(insightText);
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.toString();
            if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                setInsights('⚠️ AI Usage Limit Reached\n\nThe free tier quota for AI insights has been exceeded. Please try again later.');
            } else {
                setInsights('Failed to generate insights. Please check your AI API key in .env file.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>AI Insights</Text>

                {/* Info Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="sparkles" size={32} color={theme.primary} />
                    </View>
                    <Text style={[styles.description, { color: theme.text }]}>
                        Get personalized financial advice and spending analysis powered by AI.
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={generateInsights}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <IconSymbol name="wand.and.stars" size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Generate Insights</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={[styles.loadingCard, { backgroundColor: theme.card }]}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={[styles.loadingText, { color: theme.text }]}>
                            Analyzing your spending patterns...
                        </Text>
                    </View>
                )}

                {insights && !loading && (
                    <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
                        <View style={styles.resultHeader}>
                            <IconSymbol name="lightbulb.fill" size={24} color={theme.secondary} />
                            <Text style={[styles.resultTitle, { color: theme.text }]}>Your Insights</Text>
                        </View>
                        <Markdown
                            style={{
                                body: { color: theme.text, fontSize: 15, lineHeight: 24 },
                                heading1: { color: theme.primary, marginBottom: 12, fontSize: 22 },
                                heading2: { color: theme.text, marginTop: 16, marginBottom: 8, fontSize: 18 },
                                heading3: { color: theme.text, marginTop: 12, marginBottom: 6, fontSize: 16 },
                                strong: { color: theme.text, fontWeight: 'bold' },
                                em: { color: theme.icon, fontStyle: 'italic' },
                                bullet_list: { marginVertical: 8 },
                                ordered_list: { marginVertical: 8 },
                                list_item: { marginVertical: 4 },
                            }}
                        >
                            {insights}
                        </Markdown>
                    </View>
                )}

                {!insights && !loading && (
                    <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                        <IconSymbol name="chart.line.uptrend.xyaxis" size={48} color={theme.icon} />
                        <Text style={[styles.emptyText, { color: theme.icon }]}>
                            No insights yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.icon }]}>
                            Generate AI-powered insights to understand your spending
                        </Text>
                    </View>
                )}
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
        paddingBottom: 100,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingCard: {
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    resultCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    emptyCard: {
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
