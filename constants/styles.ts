import { StyleSheet } from 'react-native';
import { Colors } from './index';

// Fonts
export const Fonts = {
  headline: 'BebasNeue',
  body: 'RobotoCondensed',
  // Alias for backwards compatibility
  regular: 'BebasNeue',
};

// Typography
export const Typography = {
  hero: {
    fontFamily: Fonts.headline,
    fontSize: 55,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 37,
    letterSpacing: 1,
  },
  heading: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    letterSpacing: 1,
  },
  bodyLarge: {
    fontFamily: Fonts.body,
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});