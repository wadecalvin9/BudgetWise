import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { exportToCSV, exportToPDF, saveAndShareFile } from '@/services/exportService';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ExportFormat = 'csv' | 'pdf';
type DateRange = 'month' | '3months' | 'year' | 'all';

const dateRangeOptions: { value: DateRange; label: string; description: string }[] = [
    { value: 'month', label: 'This Month', description: 'Current month transactions' },
    { value: '3months', label: 'Last 3 Months', description: 'Past 3 months of data' },
    { value: 'year', label: 'This Year', description: 'Current year transactions' },
    { value: 'all', label: 'All Time', description: 'All your transactions' },
];

export default function ExportScreen() {
    const { activeTheme, currencySymbol } = useTheme();
    const colors = Colors[activeTheme];
    const db = useSQLiteContext();

    const [format, setFormat] = useState<ExportFormat>('csv');
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);

            let content: string;
            let filename: string;

            if (format === 'csv') {
                content = await exportToCSV(db, { format, dateRange, includeBudgets: true });
                filename = `financial_report_${Date.now()}.csv`;
            } else {
                content = await exportToPDF(db, { format, dateRange, includeBudgets: true }, currencySymbol);
<<<<<<< HEAD
                filename = `financial_report_${Date.now()}.txt`;
=======
                filename = `financial_report_${Date.now()}.pdf`;
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
            }

            await saveAndShareFile(content, filename);

            Alert.alert('Success', 'Your data has been exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Export Failed', 'Unable to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Export Data</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Format Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>FORMAT</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <TouchableOpacity
                            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                            onPress={() => setFormat('csv')}
                        >
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: format === 'csv' ? colors.primary + '20' : 'transparent' }]}>
                                    <IconSymbol name="doc.text" size={20} color={format === 'csv' ? colors.primary : colors.icon} />
                                </View>
                                <View>
                                    <Text style={[styles.rowLabel, { color: colors.text, fontWeight: format === 'csv' ? '600' : '400' }]}>
                                        CSV File
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.icon }]}>Spreadsheet format</Text>
                                </View>
                            </View>
                            {format === 'csv' && <IconSymbol name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.row} onPress={() => setFormat('pdf')}>
                            <View style={styles.rowContent}>
                                <View style={[styles.iconContainer, { backgroundColor: format === 'pdf' ? colors.primary + '20' : 'transparent' }]}>
                                    <IconSymbol name="doc.fill" size={20} color={format === 'pdf' ? colors.primary : colors.icon} />
                                </View>
                                <View>
                                    <Text style={[styles.rowLabel, { color: colors.text, fontWeight: format === 'pdf' ? '600' : '400' }]}>
<<<<<<< HEAD
                                        Text Report
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.icon }]}>Formatted text document</Text>
=======
                                        PDF Report
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.icon }]}>Text-based report</Text>
>>>>>>> 0f282162e89573e64e1a5d71bc8d5c09fd540972
                                </View>
                            </View>
                            {format === 'pdf' && <IconSymbol name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Range Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>DATE RANGE</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        {dateRangeOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.row,
                                    index < dateRangeOptions.length - 1 && {
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                        borderBottomColor: colors.border,
                                    },
                                ]}
                                onPress={() => setDateRange(option.value)}
                            >
                                <View style={styles.rowContent}>
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            { backgroundColor: dateRange === option.value ? colors.primary + '20' : 'transparent' },
                                        ]}
                                    >
                                        <IconSymbol
                                            name="calendar"
                                            size={20}
                                            color={dateRange === option.value ? colors.primary : colors.icon}
                                        />
                                    </View>
                                    <View>
                                        <Text
                                            style={[
                                                styles.rowLabel,
                                                { color: colors.text, fontWeight: dateRange === option.value ? '600' : '400' },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        <Text style={[styles.rowSubtitle, { color: colors.icon }]}>{option.description}</Text>
                                    </View>
                                </View>
                                {dateRange === option.value && <IconSymbol name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Export Button */}
                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: colors.primary }]}
                    onPress={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <IconSymbol name="tray" size={20} color="#FFF" />
                            <Text style={styles.exportButtonText}>Export Data</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={[styles.infoText, { color: colors.icon }]}>
                    Your data will be exported and you can share it via email, cloud storage, or other apps.
                </Text>
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
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 12,
        letterSpacing: 0.5,
    },
    sectionContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    exportButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    infoText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
});
