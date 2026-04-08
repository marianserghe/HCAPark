import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, Link } from 'expo-router';
import { Colors, PARK_LOCATION } from '@/constants';
import { supabase, Household } from '@/lib/supabase';

export default function MapScreen() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const totalHouseholds = households.length;
  const paidCount = households.filter(h => h.status === 'paid').length;
  const percentagePaid = totalHouseholds > 0 ? Math.round((paidCount / totalHouseholds) * 100) : 0;

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function loadHouseholds() {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .order('street', { ascending: true })
        .order('house_number', { ascending: true });
      
      if (error) throw error;
      setHouseholds(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
        <TouchableOpacity style={styles.retryButton} onPress={loadHouseholds}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{percentagePaid}%</Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{paidCount}/{totalHouseholds}</Text>
          <Text style={styles.statLabel}>Households</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.error }]}>
            {totalHouseholds - paidCount}
          </Text>
          <Text style={styles.statLabel}>Unpaid</Text>
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
                      {household.status === 'paid' ? 'View Details' : 'Pay Dues'}
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
          <Text style={styles.adminButtonText}>Admin</Text>
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
    marginTop: 10,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  calloutStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  calloutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adminButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});