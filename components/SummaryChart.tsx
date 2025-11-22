import { ThemedText } from '@/components/themed-text';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface ChartData {
    value: number;
    color: string;
    text?: string;
}

interface SummaryChartProps {
    data: ChartData[];
    total?: number;
}

export function SummaryChart({ data, total }: SummaryChartProps) {
    const chartTotal = total ?? data.reduce((acc, item) => acc + item.value, 0);

    return (
        <View style={styles.container}>
            <View style={styles.chartContainer}>
                <PieChart
                    data={data}
                    donut
                    showText
                    textColor="white"
                    radius={120}
                    innerRadius={80}
                    textSize={12}
                    centerLabelComponent={() => {
                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <ThemedText type="title">${chartTotal.toFixed(0)}</ThemedText>
                                <ThemedText style={{ fontSize: 10 }}>Total</ThemedText>
                            </View>
                        );
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    title: {
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
