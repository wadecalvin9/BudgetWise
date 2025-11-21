import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { addCategory, Category, getCategories } from '@/services/categoryService';
import { addRecurringTransaction } from '@/services/recurringTransactionService';
import { useFocusEffect } from '@react-navigation/native';

export default function AddRecurringScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadCategories();
        }, [])
    );

    const loadCategories = async () => {
        const cats = await getCategories(db);
        setCategories(cats);
    };

    const handleSave = async () => {
        if (!amount || !category) {
            Alert.alert('Missing Information', 'Please enter amount and select a category');
            return;
        }

        try {
            await addRecurringTransaction(db, {
                amount: parseFloat(amount),
                category,
                description,
                type,
                frequency,
                next_date: startDate.getTime(),
                active: true
            });

            Alert.alert('Success', 'Recurring transaction created!');
            router.back();
        } catch (error) {
            console.error('Error adding recurring transaction:', error);
            Alert.alert('Error', 'Failed to create recurring transaction');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            await addCategory(db, {
                name: newCategoryName.trim(),
                type,
                icon: 'tag',
                color: theme.primary
            });
            await loadCategories();
            setCategory(newCategoryName.trim());
            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (error) {
            console.error('Error adding category:', error);
            Alert.alert('Error', 'Failed to add category');
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    const frequencies = [
        { value: 'daily', label: 'Daily', icon: 'sun.max' },
        { value: 'weekly', label: 'Weekly', icon: 'calendar' },
        { value: 'monthly', label: 'Monthly', icon: 'calendar.badge.clock' },
        { value: 'yearly', label: 'Yearly', icon: 'calendar.circle' }
    ] as const;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="xmark" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>New Recurring</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Type Selector */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Type</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                { backgroundColor: theme.card },
                                type === 'expense' && { backgroundColor: theme.error }
                            ]}
                            onPress={() => setType('expense')}
                        >
                            <IconSymbol name="arrow.down.circle" size={24} color={type === 'expense' ? '#FFF' : theme.icon} />
                            <Text style={[styles.typeText, { color: type === 'expense' ? '#FFF' : theme.text }]}>
                                Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                { backgroundColor: theme.card },
                                type === 'income' && { backgroundColor: theme.success }
                            ]}
                            onPress={() => setType('income')}
                        >
                            <IconSymbol name="arrow.up.circle" size={24} color={type === 'income' ? '#FFF' : theme.icon} />
                            <Text style={[styles.typeText, { color: type === 'income' ? '#FFF' : theme.text }]}>
                                Income
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
                    <View style={[styles.amountContainer, { backgroundColor: theme.card }]}>
                        <Text style={[styles.currencySymbol, { color: theme.icon }]}>{currencySymbol}</Text>
                        <TextInput
                            style={[styles.amountInput, { color: theme.text }]}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Frequency Selector */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Frequency</Text>
                    <View style={styles.frequencyGrid}>
                        {frequencies.map((freq) => (
                            <TouchableOpacity
                                key={freq.value}
                                style={[
                                    styles.frequencyButton,
                                    { backgroundColor: theme.card },
                                    frequency === freq.value && { borderColor: theme.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setFrequency(freq.value)}
                            >
                                <IconSymbol
                                    name={freq.icon}
                                    size={24}
                                    color={frequency === freq.value ? theme.primary : theme.icon}
                                />
                                <Text style={[
                                    styles.frequencyText,
                                    { color: frequency === freq.value ? theme.primary : theme.text }
                                ]}>
                                    {freq.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Start Date */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
                    <TouchableOpacity
                        style={[styles.dateButton, { backgroundColor: theme.card }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <IconSymbol name="calendar" size={20} color={theme.icon} />
                        <Text style={[styles.dateText, { color: theme.text }]}>
                            {startDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setStartDate(date);
                        }}
                    />
                )}

                {/* Category */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {filteredCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: theme.card },
                                    category === cat.name && { backgroundColor: theme.primary }
                                ]}
                                onPress={() => setCategory(cat.name)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    { color: category === cat.name ? '#FFF' : theme.text }
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.categoryChip, { backgroundColor: theme.secondary }]}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <IconSymbol name="plus" size={16} color="#FFF" />
                            <Text style={styles.addCategoryText}>Add</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.descriptionInput, { backgroundColor: theme.card, color: theme.text }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g., Netflix subscription"
                        placeholderTextColor={theme.icon}
                        multiline
                    />
                </View>
            </ScrollView>

            {/* Add Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>New Category</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="Category name"
                            placeholderTextColor={theme.icon}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.background }]}
                                onPress={() => {
                                    setShowCategoryModal(false);
                                    setNewCategoryName('');
                                }}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                                onPress={handleAddCategory}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: 'bold',
        paddingVertical: 16,
    },
    frequencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    frequencyButton: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    frequencyText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    dateText: {
        fontSize: 16,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    addCategoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFF',
    },
    descriptionInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
