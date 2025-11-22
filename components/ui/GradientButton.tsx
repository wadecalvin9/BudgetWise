import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface GradientButtonProps extends TouchableOpacityProps {
    title: string;
    colors?: string[];
}

export function GradientButton({ title, colors, style, ...props }: GradientButtonProps) {
    const gradientColors = colors || Colors.dark.gradients.primary;

    return (
        <TouchableOpacity style={[styles.container, style]} {...props}>
            <LinearGradient
                colors={gradientColors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 50,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
