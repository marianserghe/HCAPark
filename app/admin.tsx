import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants';
import { useHouseholds } from '@/lib/HouseholdsContext';
import { Household } from '@/lib/supabase';

export default function AdminScreen() {
  const { households, loading, error, refresh, togglePaid, stats } = useHouseholds();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'unpaid'>('all');

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredHouseholds = households.filter(h => {
    const matchesSearch = 
      h.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.house_number.includes(searchQuery);
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'paid' && h.status === 'paid') ||
      (filter === 'unpaid' && h.status === 'unpaid');
    
    return matchesSearch && matchesFilter;
  });

  async function handleTogglePaid(household: Household) {
    try {
      await togglePaid(household);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Collected:</Text>
          <Text style={styles.summaryValue}>${stats.totalCollected.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Expected:</Text>
          <Text style={styles.summaryValue}>${stats.expectedTotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: Colors.error }]}>Outstanding:</Text>
          <Text style={[styles.summaryValue, { color: Colors.error }]}>
            ${(stats.expectedTotal - stats.totalCollected).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Paid:</Text>
          <Text style={styles.summaryValue}>{stats.paidCount}/{stats.total} households</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by street or name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textSecondary}
        />
        <View style={styles.filterButtons}>
          {(['all', 'paid', 'unpaid'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText,
                filter === f && styles.filterTextActive
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Household List */}
      <FlatList
        data={filteredHouseholds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.householdRow}
            onPress={() => handleTogglePaid(item)}
          >
            <View style={styles.householdInfo}>
              <Text style={styles.address}>
                {item.house_number} {item.street}
              </Text>
              <Text style={styles.name}>
                {item.last_name}, {item.first_name}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'paid' ? Colors.primary : Colors.error }
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'paid' ? '✓' : '✗'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingVertical: 8,
  },
  householdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  householdInfo: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  name: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});