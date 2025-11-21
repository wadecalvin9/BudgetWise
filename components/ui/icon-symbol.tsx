// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation icons
  'house.fill': 'home',
  'chart.pie.fill': 'pie-chart',
  'plus': 'add',
  'sparkles': 'auto-awesome',
  'person.fill': 'person',

  // Transaction icons
  'cart.fill': 'shopping-cart',
  'car.fill': 'directions-car',
  'banknote.fill': 'attach-money',
  'briefcase.fill': 'work',
  'book.fill': 'menu-book',
  'bag.fill': 'shopping-bag',
  'film.fill': 'movie',
  'cross.fill': 'local-hospital',
  'ellipsis.circle.fill': 'more-horiz',

  // Action icons
  'trash': 'delete',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'bell.fill': 'notifications',
  'plus.circle.fill': 'add-circle',
  'arrow.down.circle.fill': 'arrow-circle-down',
  'arrow.up.circle.fill': 'arrow-circle-up',
  'checkmark': 'check',
  'tray': 'inbox',
  'xmark': 'close',
  'chevron.left': 'chevron-left',
  'magnifyingglass': 'search',
  'doc.text': 'description',
  'doc.fill': 'article',

  // Recurring icons
  'arrow.clockwise': 'autorenew',
  'calendar': 'calendar-today',
  'calendar.badge.clock': 'event-repeat',
  'sun.max': 'wb-sunny',
  'calendar.circle': 'date-range',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'arrow.down.circle': 'arrow-circle-down',
  'arrow.up.circle': 'arrow-circle-up',

  // Existing
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',
  'target': 'track-changes',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
