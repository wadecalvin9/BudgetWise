/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000000',
    background: '#F5F5F5',
    tint: '#2A1639',
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: '#2A1639',
    primary: '#2A1639', // Dark Purple
    secondary: '#FFD146', // Yellow/Gold
    card: '#FFFFFF',
    border: '#E5E5E5',
    success: '#4CD964',
    error: '#FF3B30',
    warning: '#FF9500',
    gradients: {
      primary: ['#2A1639', '#4A266A'],
      secondary: ['#353534ff', '#2f2f2fff'],
      dark: ['#F5F5F5', '#F5F5F5'], // Light background
      card1: ['#E6F7F3', '#E6F7F3'], // Pastel Green
      card2: ['#FDF1F3', '#FDF1F3'], // Pastel Pink
    }
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: '#FFD146',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFD146',
    primary: '#A78BFA', // Brighter purple for better visibility
    secondary: '#FFD146',
    card: '#1E1E1E',
    border: '#2C2C2C',
    success: '#4CD964',
    error: '#FF3B30',
    warning: '#FF9500',
    gradients: {
      primary: ['#A78BFA', '#8B5CF6'],
      secondary: ['#FFD146', '#FFC107'],
      dark: ['#121212', '#1E1E1E'],
      card1: ['#1E2A26', '#1E2A26'],
      card2: ['#2A1E20', '#2A1E20'],
    }
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
