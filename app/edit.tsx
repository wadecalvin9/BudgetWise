import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { addCategory, Category, getCategories } from '@/services/categoryService';
import { getTransactions, updateTransaction } from '@/services/transactionService';

export default function EditScreen() {
    const db = useSQLiteContext();
    const { activeTheme, currencySymbol } = useTheme();
    const theme = Colors[activeTheme];
    const params = useLocalSearchParams();
    const editId = params.id ? parseInt(params.id as string) : null;

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        loadCategories();
        if (editId) {
            loadTransaction();
        }
    }, [editId]);

    const loadTransaction = async () => {
        if (!editId) return;
        try {
            const transactions = await getTransactions(db);
            const transaction = transactions.find(t => t.id === editId);
            if (transaction) {
                setAmount(transaction.amount.toString());
                setCategory(transaction.category);
                setDescription(transaction.description || '');
                setType(transaction.type);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadCategories = async () => {
        const cats = await getCategories(db);
        setCategories(cats);
    };

    const handleSave = async () => {
        if (!amount || !category || !editId) return;

        try {
            await updateTransaction(db, editId, {
                amount: parseFloat(amount),
                category,
                description,
                date: Date.now(),
                type,
            });
            router.back();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            await addCategory(db, { name: newCategoryName, type });
            await loadCategories();
            setCategory(newCategoryName);
            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <IconSymbol name="chevron.left" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Edit Transaction
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Type Selector */}
                    <View style={[styles.typeContainer, { backgroundColor: theme.card }]}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'expense' && { backgroundColor: '#FF3B30' }
                            ]}
                            onPress={() => setType('expense')}
                        >
                            <IconSymbol name="arrow.up.circle.fill" size={20} color={type === 'expense' ? '#FFF' : theme.icon} />
                            <Text style={[styles.typeText, { color: type === 'expense' ? '#FFF' : theme.text }]}>
                                Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'income' && { backgroundColor: '#4CD964' }
                            ]}
                            onPress={() => setType('income')}
                        >
                            <IconSymbol name="arrow.down.circle.fill" size={20} color={type === 'income' ? '#FFF' : theme.icon} />
                            <Text style={[styles.typeText, { color: type === 'income' ? '#FFF' : theme.text }]}>
                                Income
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.label, { color: theme.icon }]}>Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={[styles.currencySymbol, { color: theme.text }]}>{currencySymbol}</Text>
                            <TextInput
                                style={[styles.amountInput, { color: theme.text }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.icon}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.label, { color: theme.icon }]}>Category</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <Text style={[styles.selectText, { color: category ? theme.text : theme.icon }]}>
                                {category || 'Select Category'}
                            </Text>
                            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.label, { color: theme.icon }]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
                            placeholder="Add a note..."
                            placeholderTextColor={theme.icon}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: type === 'expense' ? '#FF3B30' : '#4CD964' }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            Update Transaction
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <IconSymbol name="xmark" size={24} color={theme.icon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.categoryList}>
                            {categories.filter(c => c.type === type).map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.categoryItem}
                                    onPress={() => { setCategory(item.name); setShowCategoryModal(false); }}
                                >
                                    <Text style={[styles.categoryItemText, { color: theme.text }]}>{item.name}</Text>
                                    {category === item.name && (
                                        <IconSymbol name="checkmark" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Add New Category */}
                        <View style={styles.newCategoryContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10, color: theme.text, borderColor: theme.icon }]}
                                placeholder="New Category"
                                placeholderTextColor={theme.icon}
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                            />
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: theme.primary }]}
                                onPress={handleAddCategory}
                            >
                                <IconSymbol name="plus" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    typeContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
        gap: 8,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: 'bold',
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    selectText: {
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveButton: {
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    categoryList: {
        maxHeight: 300,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    categoryItemText: {
        fontSize: 16,
    },
    newCategoryContainer: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
