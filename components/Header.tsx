import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = false }: HeaderProps) {
  return (
    <View style={styles.container}>
      {showLogo ? (
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      ) : null}
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    letterSpacing: 2,
    color: '#fff',
  },
});