import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'NGN' | 'KES';

interface ThemeContextType {
    theme: Theme;
    activeTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    currencySymbol: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    NGN: '₦',
    KES: 'KSh',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [theme, setThemeState] = useState<Theme>('system');
    const [currency, setCurrencyState] = useState<Currency>('USD');

    // Load saved preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedCurrency = await AsyncStorage.getItem('currency');

            if (savedTheme) setThemeState(savedTheme as Theme);
            if (savedCurrency) setCurrencyState(savedCurrency as Currency);
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const setCurrency = async (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        try {
            await AsyncStorage.setItem('currency', newCurrency);
        } catch (error) {
            console.error('Error saving currency:', error);
        }
    };

    const activeTheme: 'light' | 'dark' =
        theme === 'system' ? (systemColorScheme ?? 'light') : theme;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                activeTheme,
                setTheme,
                currency,
                setCurrency,
                currencySymbol: currencySymbols[currency],
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
