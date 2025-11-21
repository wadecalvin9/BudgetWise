import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD146',
        tabBarInactiveTintColor: '#FFFFFF',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          height: 70,
          backgroundColor: '#2A1639',
          borderRadius: 35,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={24} name="chart.pie.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add');
          },
        })}
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.fabContainer}>
              <View style={styles.fab}>
                <IconSymbol size={28} name="plus" color="#2A1639" />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={24} name="sparkles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={24} name="chart.pie.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD146',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#F8F9FD',
  },
});
