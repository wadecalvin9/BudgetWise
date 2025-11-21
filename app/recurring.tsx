import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteRecurringTransaction, getRecurringTransactions, updateRecurringTransaction, type RecurringTransaction } from '@/services/recurringTransactionService';

export default function RecurringTransactionsScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const colors = Colors[activeTheme];

    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadRecurring = useCallback(async () => {
        try {
            const data = await getRecurringTransactions(db);
            setRecurring(data);
        } catch (error) {
            console.error('Error loading recurring transactions:', error);
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            loadRecurring();
        }, [loadRecurring])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRecurring();
        setRefreshing(false);
    };

    const handleToggleActive = async (item: RecurringTransaction) => {
        try {
            await updateRecurringTransaction(db, item.id!, { active: !item.active });
            await loadRecurring();
        } catch (error) {
            console.error('Error toggling recurring transaction:', error);
            Alert.alert('Error', 'Failed to update recurring transaction');
        }
    };

    const handleDelete = (item: RecurringTransaction) => {
        Alert.alert(
            'Delete Recurring Transaction',
            `Are you sure you want to delete this recurring ${item.type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRecurringTransaction(db, item.id!);
                            await loadRecurring();
                        } catch (error) {
                            console.error('Error deleting recurring transaction:', error);
                            Alert.alert('Error', 'Failed to delete recurring transaction');
                        }
                    }
                }
            ]
        );
    };

    const getFrequencyLabel = (frequency: string) => {
        const labels: Record<string, string> = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly'
        };
        return labels[frequency] || frequency;
    };

    const formatNextDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return date.toLocaleDateString();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Recurring</Text>
                <TouchableOpacity
                    onPress={() => router.push('/add-recurring')}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <IconSymbol name="plus" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {recurring.length === 0 ? (
                    <View style={styles.emptyState}>
                        <IconSymbol name="arrow.clockwise" size={64} color={colors.icon} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Recurring Transactions</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                            Set up automatic bills and income
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/add-recurring')}
                        >
                            <Text style={styles.emptyButtonText}>Add Recurring Transaction</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {recurring.map((item) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.card,
                                    { backgroundColor: colors.card },
                                    !item.active && styles.inactiveCard
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardInfo}>
                                        <Text style={[styles.category, { color: colors.text }]}>
                                            {item.category}
                                        </Text>
                                        <Text style={[styles.description, { color: colors.icon }]}>
                                            {item.description || 'No description'}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.amount,
                                            { color: item.type === 'income' ? colors.success : colors.error }
                                        ]}
                                    >
                                        {item.type === 'income' ? '+' : '-'}{currencySymbol}{item.amount.toFixed(0)}
                                    </Text>
                                </View>

                                <View style={styles.cardMeta}>
                                    <View style={styles.metaItem}>
                                        <IconSymbol name="arrow.clockwise" size={16} color={colors.icon} />
                                        <Text style={[styles.metaText, { color: colors.icon }]}>
                                            {getFrequencyLabel(item.frequency)}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <IconSymbol name="calendar" size={16} color={colors.icon} />
                                        <Text style={[styles.metaText, { color: colors.icon }]}>
                                            Next: {formatNextDate(item.next_date)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: item.active ? colors.warning : colors.success }]}
                                        onPress={() => handleToggleActive(item)}
                                    >
                                        <IconSymbol
                                            name={item.active ? 'pause.fill' : 'play.fill'}
                                            size={16}
                                            color="#FFF"
                                        />
                                        <Text style={styles.actionButtonText}>
                                            {item.active ? 'Pause' : 'Resume'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                                        onPress={() => handleDelete(item)}
                                    >
                                        <IconSymbol name="trash" size={16} color="#FFF" />
                                        <Text style={styles.actionButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        gap: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inactiveCard: {
        opacity: 0.6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardInfo: {
        flex: 1,
    },
    category: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
