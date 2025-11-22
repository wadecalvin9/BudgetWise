import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewProps } from 'react-native';

interface GlassViewProps extends ViewProps {
    intensity?: number;
}

export function GlassView({ style, children, intensity = 0.1, ...props }: GlassViewProps) {
    return (
        <View style={[styles.container, style]} {...props}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <View style={[styles.content, { backgroundColor: `rgba(0,0,0,${0.3})` }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        padding: 16,
    },
});
