import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { BudgetProgress, deleteBudget, getBudgetProgress, setBudget } from '@/services/budgetService';

export default function BudgetScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];

    const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadBudgets = useCallback(async () => {
        try {
            const data = await getBudgetProgress(db);
            setBudgets(data);
        } catch (e) {
            console.error(e);
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            loadBudgets();
        }, [loadBudgets])
    );

    const handleSetBudget = async () => {
        if (!newCategory || !newAmount) return;
        try {
            await setBudget(db, {
                category: newCategory,
                amount: parseFloat(newAmount),
                period: 'monthly',
            });
            setNewCategory('');
            setNewAmount('');
            setEditingCategory(null);
            loadBudgets();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditBudget = (budget: BudgetProgress) => {
        setNewCategory(budget.category);
        setNewAmount(budget.amount.toString());
        setEditingCategory(budget.category);
    };

    const handleDeleteBudget = (category: string) => {
        Alert.alert(
            'Delete Budget',
            `Are you sure you want to delete the budget for ${category}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBudget(db, category);
                            loadBudgets();
                        } catch (e) {
                            console.error(e);
                        }
                    },
                },
            ]
        );
    };

    const handleCancelEdit = () => {
        setNewCategory('');
        setNewAmount('');
        setEditingCategory(null);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBudgets();
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                <Text style={[styles.headerTitle, { color: theme.text }]}>Budget</Text>

                {/* Set Budget Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {editingCategory ? 'Edit Budget' : 'Set Monthly Budget'}
                    </Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10, color: theme.text, borderColor: theme.icon }]}
                            placeholder="Category"
                            placeholderTextColor={theme.icon}
                            value={newCategory}
                            onChangeText={setNewCategory}
                            editable={!editingCategory}
                        />
                        <TextInput
                            style={[styles.input, { width: 100, color: theme.text, borderColor: theme.icon }]}
                            placeholder="Amount"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={newAmount}
                            onChangeText={setNewAmount}
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        {editingCategory && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { backgroundColor: theme.icon + '30' }]}
                                onPress={handleCancelEdit}
                            >
                                <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary, flex: editingCategory ? 1 : undefined }]}
                            onPress={handleSetBudget}
                        >
                            <Text style={styles.buttonText}>
                                {editingCategory ? 'Update Budget' : 'Set Budget'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Budget List */}
                <View style={styles.listContainer}>
                    {budgets.length === 0 ? (
                        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                            <IconSymbol name="chart.bar" size={48} color={theme.icon} />
                            <Text style={[styles.emptyText, { color: theme.icon }]}>
                                No budgets set yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.icon }]}>
                                Create your first budget above to track spending
                            </Text>
                        </View>
                    ) : (
                        budgets.map((b) => {
                            const progress = Math.min(b.spent / b.limit, 1);
                            const isOver = b.spent > b.limit;
                            const color = isOver ? theme.error : theme.success;
                            const percentage = ((b.spent / b.limit) * 100).toFixed(0);

                            return (
                                <View key={b.category} style={[styles.budgetCard, { backgroundColor: theme.card }]}>
                                    <View style={styles.budgetHeader}>
                                        <Text style={[styles.categoryText, { color: theme.text }]}>{b.category}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.iconButton}
                                                onPress={() => handleEditBudget(b)}
                                            >
                                                <IconSymbol name="pencil" size={18} color={theme.icon} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.iconButton}
                                                onPress={() => handleDeleteBudget(b.category)}
                                            >
                                                <IconSymbol name="trash" size={18} color={theme.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.statsRow}>
                                        <Text style={[styles.percentageText, { color: isOver ? theme.error : theme.text }]}>
                                            {percentage}% used
                                        </Text>
                                        <Text style={[styles.remainingText, { color: theme.icon }]}>
                                            {currencySymbol}{Math.max(0, b.remaining).toFixed(0)} left
                                        </Text>
                                    </View>
                                    <View style={styles.amountRow}>
                                        <Text style={[styles.spentText, { color: theme.text }]}>
                                            {currencySymbol}{b.spent.toFixed(0)}
                                        </Text>
                                        <Text style={[styles.limitText, { color: theme.icon }]}>
                                            / {currencySymbol}{b.limit.toFixed(0)}
                                        </Text>
                                    </View>
                                    <Progress.Bar
                                        progress={progress}
                                        width={null}
                                        height={8}
                                        color={color}
                                        unfilledColor={theme.background}
                                        borderWidth={0}
                                        borderRadius={4}
                                        style={{ marginTop: 12 }}
                                    />
                                    {isOver && (
                                        <View style={[styles.warningBadge, { backgroundColor: theme.error + '20' }]}>
                                            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={theme.error} />
                                            <Text style={[styles.warningText, { color: theme.error }]}>
                                                Over budget by {currencySymbol}{(b.spent - b.limit).toFixed(0)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
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
        paddingBottom: 100,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
    },
    cancelButton: {
        flex: 0.4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        gap: 16,
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
    budgetCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    remainingText: {
        fontSize: 14,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    spentText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    limitText: {
        fontSize: 16,
        marginLeft: 4,
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 8,
        borderRadius: 8,
        gap: 6,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
