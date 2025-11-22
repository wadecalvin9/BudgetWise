import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getTransactions, Transaction } from '@/services/transactionService';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any>({ labels: [], datasets: [{ data: [] }] });

    const loadData = useCallback(async () => {
        try {
            const data = await getTransactions(db);
            setTransactions(data);

            // Process category breakdown
            const expenseMap = new Map<string, number>();
            data.filter(t => t.type === 'expense').forEach(t => {
                expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
            });

            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
            const pieData = Array.from(expenseMap.entries()).map(([name, population], index) => ({
                name,
                population,
                color: colors[index % colors.length],
                legendFontColor: theme.text,
                legendFontSize: 14,
            }));
            setCategoryData(pieData);

            // Process monthly data (last 6 months)
            const monthlyMap = new Map<string, number>();
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = month.toLocaleDateString('en-US', { month: 'short' });
                monthlyMap.set(monthKey, 0);
            }

            data.filter(t => t.type === 'expense').forEach(t => {
                const date = new Date(t.date);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
                if (monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + t.amount);
                }
            });

            setMonthlyData({
                labels: Array.from(monthlyMap.keys()),
                datasets: [{ data: Array.from(monthlyMap.values()) }],
            });

        } catch (e) {
            console.error(e);
        }
    }, [db, theme]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const chartConfig = {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${activeTheme === 'dark' ? '187, 134, 252' : '42, 22, 57'}, ${opacity})`,
        labelColor: (opacity = 1) => theme.text,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.primary,
        },
    };

    const totalExpense = categoryData.reduce((sum, item) => sum + item.population, 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.header, { color: theme.text }]}>Statistics</Text>

                {/* Total Spending Card */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Total Spending</Text>
                    <Text style={[styles.totalAmount, { color: theme.primary }]}>
                        {currencySymbol} {totalExpense.toLocaleString()}
                    </Text>
                </View>

                {/* Category Breakdown */}
                {categoryData.length > 0 && (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Spending by Category</Text>
                        <PieChart
                            data={categoryData}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                )}

                {/* Monthly Trend */}
                {monthlyData.datasets[0].data.length > 0 && (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Monthly Spending Trend</Text>
                        <LineChart
                            data={monthlyData}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {/* Top Categories */}
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Top Spending Categories</Text>
                    {categoryData.slice(0, 5).map((item, index) => (
                        <View key={item.name} style={styles.categoryRow}>
                            <View style={styles.categoryLeft}>
                                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
                            </View>
                            <Text style={[styles.categoryAmount, { color: theme.text }]}>
                                {currencySymbol} {item.population.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>

                {transactions.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: theme.icon }]}>
                            No data available. Add some transactions to see statistics.
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
        paddingBottom: 120,
    },
    header: {
        fontSize: 34,
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
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        fontSize: 16,
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
