import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { TransactionCard } from '@/components/TransactionCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { processRecurringTransactions } from '@/services/recurringTransactionService';
import { getTransactionsByDateRange, Transaction } from '@/services/transactionService';

type FilterType = 'Week' | 'Month' | 'Year';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const { activeTheme, currencySymbol } = useTheme();
  const theme = Colors[activeTheme];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [filter, setFilter] = useState<FilterType>('Month');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [userName, setUserName] = useState('John Doe');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Check for first launch
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        router.push('/onboarding');
        // We don't set it to true here anymore, we do it at the end of onboarding
      }

      // Load profile data
      const savedName = await AsyncStorage.getItem('user_name');
      const savedAvatar = await AsyncStorage.getItem('user_avatar');
      if (savedName) setUserName(savedName);
      if (savedAvatar) setUserAvatar(savedAvatar);

      // Process recurring transactions first
      await processRecurringTransactions(db);

      let data: Transaction[] = [];
      const now = new Date();
      let startDate = 0;
      const endDate = now.getTime();

      // Calculate date range based on filter
      if (filter === 'Week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
      } else if (filter === 'Month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      } else if (filter === 'Year') {
        startDate = new Date(now.getFullYear(), 0, 1).getTime();
      }

      data = await getTransactionsByDateRange(db, startDate, endDate);
      setTransactions(data);

      // Calculate totals from ALL data (before filtering)
      let income = 0;
      let expense = 0;
      data.forEach(t => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);
      setTotalBalance(income - expense);

      // Apply search filter ONLY for display
      let filtered = data;
      if (searchQuery) {
        filtered = filtered.filter(t =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setFilteredTransactions(filtered);

    } catch (e) {
      console.error(e);
    }
  }, [db, filter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{userName.charAt(0)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text style={[styles.greeting, { color: theme.icon }]}>Good Morning</Text>
            <Text style={[styles.username, { color: theme.text }]}>{userName}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.card }]}>
          <IconSymbol name="bell.fill" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Fixed Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <IconSymbol name={balanceVisible ? "eye" : "eye.slash"} size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {balanceVisible ? `${currencySymbol} ${totalBalance.toLocaleString()}` : '••••••'}
        </Text>
        <Text style={styles.balanceName}>Albert Flores</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/recurring')} style={styles.recurringButton}>
            <IconSymbol name="arrow.clockwise" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
            <IconSymbol name="plus.circle.fill" size={36} color="#FFD146" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fixed Date Filter */}
      <View style={styles.filterRow}>
        {(['Week', 'Month', 'Year'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
              { backgroundColor: filter === f ? theme.primary : theme.card }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? '#FFFFFF' : theme.text }
            ]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <IconSymbol name="magnifyingglass" size={20} color={theme.icon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark" size={20} color={theme.icon} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Fixed Statistics Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E6F7F3' }]}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: '#1D1D1D' }]}>Income</Text>
            <IconSymbol name="arrow.down.circle.fill" size={22} color="#4CD964" />
          </View>
          <Text style={[styles.statAmount, { color: '#1D1D1D' }]}>
            {currencySymbol} {totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FDF1F3' }]}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: '#1D1D1D' }]}>Expense</Text>
            <IconSymbol name="arrow.up.circle.fill" size={22} color="#FF3B30" />
          </View>
          <Text style={[styles.statAmount, { color: '#1D1D1D' }]}>
            {currencySymbol} {totalExpense.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Scrollable Transactions Section */}
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: theme.icon }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="tray" size={48} color={theme.icon} />
            <Text style={{ color: theme.icon, marginTop: 12 }}>
              {searchQuery ? 'No matching transactions' : 'No transactions for this period'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          >
            {filteredTransactions.map((t) => (
              <TransactionCard
                key={t.id}
                id={t.id!}
                amount={t.amount}
                category={t.category}
                description={t.description}
                date={new Date(t.date).toISOString()}
                type={t.type}
                onDelete={loadData}
                onEdit={() => router.push(`/edit?id=${t.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceCard: {
    backgroundColor: '#2A1639',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    shadowOpacity: 0.2,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
  },
  transactionsList: {
    flex: 1,
    marginBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
  },
});
