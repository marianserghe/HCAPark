import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Colors, PARK_LOCATION } from '@/constants';
import { Fonts } from '@/constants/styles';
import { useHouseholds } from '@/lib/HouseholdsContext';

const ADMIN_PASSWORD = 'hca2024';

export default function MapScreen() {
  const { households, loading, error, refresh, stats } = useHouseholds();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const router = useRouter();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  function handleAdminPress() {
    setShowPasswordModal(true);
    setPassword('');
  }

  function handlePasswordSubmit() {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      setPassword('');
      router.push('/admin');
    } else {
      Alert.alert('Incorrect Password', 'Please try again.');
      setPassword('');
    }
  }

  function toggleMapType() {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
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
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'HCA PARK',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.container}>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
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
        mapType={mapType}
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
                <TouchableOpacity 
                  style={styles.calloutButton}
                  onPress={() => router.push(`/household/${household.id}`)}
                >
                  <Text style={styles.calloutButtonText}>
                    {household.status === 'paid' ? 'VIEW DETAILS' : 'PAY DUES'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map Type Toggle */}
      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeText}>
          {mapType === 'standard' ? '🛰️' : '🗺️'}
        </Text>
      </TouchableOpacity>

      {/* Admin Link */}
      <TouchableOpacity style={styles.adminButton} onPress={handleAdminPress}>
        <Text style={styles.adminButtonText}>ADMIN</Text>
      </TouchableOpacity>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADMIN ACCESS</Text>
            <Text style={styles.modalLabel}>Enter password:</Text>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
              onSubmitEditing={handlePasswordSubmit}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.textSecondary }]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.modalButtonText}>ENTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </>
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
  mapTypeButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    backgroundColor: Colors.surface,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapTypeText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    color: Colors.primary,
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: Fonts.regular,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontFamily: Fonts.regular,
    fontSize: 18,
    letterSpacing: 1,
  },
});