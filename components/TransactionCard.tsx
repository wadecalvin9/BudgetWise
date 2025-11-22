import { useSQLiteContext } from 'expo-sqlite';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteTransaction } from '@/services/transactionService';

export type TransactionType = 'income' | 'expense';

interface TransactionCardProps {
    id: number;
    amount: number;
    category: string;
    description?: string;
    date: string;
    type: TransactionType;
    onDelete?: () => void;
    onEdit?: () => void;
}

const categoryIcons: Record<string, string> = {
    'Food': 'cart.fill',
    'Rent': 'house.fill',
    'Transport': 'car.fill',
    'Salary': 'banknote.fill',
    'Freelance': 'briefcase.fill',
    'Education': 'book.fill',
    'Shopping': 'bag.fill',
    'Entertainment': 'film.fill',
    'Health': 'cross.fill',
    'Other': 'ellipsis.circle.fill',
};

const categoryColors: Record<string, string> = {
    'Food': '#FF6384',
    'Rent': '#36A2EB',
    'Transport': '#000000ff',
    'Salary': '#4BC0C0',
    'Freelance': '#9966FF',
    'Education': '#FF9F40',
    'Shopping': '#FF6384',
    'Entertainment': '#4BC0C0',
    'Health': '#FF3B30',
    'Other': '#9E9E9E',
};

export function TransactionCard({ id, amount, category, description, date, type, onDelete, onEdit }: TransactionCardProps) {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];

    const handleDelete = () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(db, id);
                        onDelete?.();
                    },
                },
            ]
        );
    };

    const iconName = categoryIcons[category] || 'ellipsis.circle.fill';
    const iconColor = categoryColors[category] || '#9E9E9E';
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={onEdit}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <IconSymbol name={iconName} size={24} color={iconColor} />
                </View>

                <View style={styles.details}>
                    <Text style={[styles.category, { color: theme.text }]}>{category}</Text>
                    <Text style={[styles.description, { color: theme.icon }]}>
                        {description || formattedDate}
                    </Text>
                </View>

                <View style={styles.right}>
                    <Text style={[
                        styles.amount,
                        { color: type === 'income' ? '#4CD964' : '#FF3B30' }
                    ]}>
                        {type === 'income' ? '+' : '-'} {currencySymbol}{amount.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        style={styles.deleteButton}
                    >
                        <IconSymbol name="trash" size={16} color={theme.icon} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    deleteButton: {
        padding: 4,
    },
});
