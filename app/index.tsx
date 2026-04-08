import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, PARK_LOCATION } from '@/constants';
import { Fonts } from '@/constants/styles';
import { useHouseholds } from '@/lib/HouseholdsContext';

export default function MapScreen() {
  const { households, loading, error, refresh, stats } = useHouseholds();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading neighborhood...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <Image 
          source={require('@/assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.percentagePaid}%</Text>
          <Text style={styles.statLabel}>PAID</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.paidCount}/{stats.total}</Text>
          <Text style={styles.statLabel}>HOUSEHOLDS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.error }]}>
            {stats.unpaidCount}
          </Text>
          <Text style={styles.statLabel}>UNPAID</Text>
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={PARK_LOCATION}
      >
        {households.filter(h => h.latitude && h.longitude).map((household) => (
          <Marker
            key={household.id}
            coordinate={{
              latitude: household.latitude!,
              longitude: household.longitude!,
            }}
            pinColor={household.status === 'paid' ? Colors.primary : Colors.error}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  {household.house_number} {household.street}
                </Text>
                <Text style={styles.calloutName}>
                  {household.last_name}, {household.first_name}
                </Text>
                <Text style={[
                  styles.calloutStatus,
                  { color: household.status === 'paid' ? Colors.primary : Colors.error }
                ]}>
                  {household.status === 'paid' ? '✓ PAID' : '✗ UNPAID'}
                </Text>
                <Link href={`/household/${household.id}`} asChild>
                  <TouchableOpacity style={styles.calloutButton}>
                    <Text style={styles.calloutButtonText}>
                      {household.status === 'paid' ? 'VIEW DETAILS' : 'PAY DUES'}
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Admin Link */}
      <Link href="/admin" asChild>
        <TouchableOpacity style={styles.adminButton}>
          <Text style={styles.adminButtonText}>ADMIN</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 21,
  },
  errorText: {
    color: Colors.error,
    fontSize: 21,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontFamily: Fonts.regular,
    fontSize: 21,
    letterSpacing: 1,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  logo: {
    width: 52,
    height: 52,
    marginHorizontal: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.regular,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 220,
    padding: 14,
  },
  calloutTitle: {
    fontSize: 20,
    fontFamily: Fonts.regular,
    marginBottom: 4,
    letterSpacing: 1,
  },
  calloutName: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontFamily: Fonts.regular,
  },
  calloutStatus: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    marginBottom: 12,
    letterSpacing: 1,
  },
  calloutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
    letterSpacing: 1,
  },
  adminButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  adminButtonText: {
    color: '#fff',
    fontFamily: Fonts.regular,
    fontSize: 21,
    letterSpacing: 1,
  },
});