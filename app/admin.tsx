import React, { useEffect, useState } from 'react';
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
import { Colors, DUES_AMOUNT } from '@/constants';
import { supabase, Household } from '@/lib/supabase';

export default function AdminScreen() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

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

  const totalCollected = households
    .filter(h => h.status === 'paid')
    .reduce((sum, h) => sum + h.amount_paid, 0);

  const expectedTotal = households.length * DUES_AMOUNT;

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function loadHouseholds() {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .order('street')
        .order('house_number');
      
      if (error) throw error;
      setHouseholds(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePaid(household: Household) {
    const newStatus = household.status === 'paid' ? 'unpaid' : 'paid';
    const newAmount = newStatus === 'paid' ? DUES_AMOUNT : 0;
    
    try {
      const { error } = await supabase
        .from('households')
        .update({ 
          status: newStatus, 
          amount_paid: newAmount,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', household.id);
      
      if (error) throw error;
      
      // Update local state
      setHouseholds(prev => 
        prev.map(h => 
          h.id === household.id 
            ? { ...h, status: newStatus, amount_paid: newAmount }
            : h
        )
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  function renderHousehold({ item }: { item: Household }) {
    return (
      <TouchableOpacity 
        style={styles.householdRow}
        onPress={() => togglePaid(item)}
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
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const paidCount = households.filter(h => h.status === 'paid').length;

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Collected:</Text>
          <Text style={styles.summaryValue}>${totalCollected.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Expected:</Text>
          <Text style={styles.summaryValue}>${expectedTotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Outstanding:</Text>
          <Text style={[styles.summaryValue, { color: Colors.error }]}>
            ${(expectedTotal - totalCollected).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Paid:</Text>
          <Text style={styles.summaryValue}>{paidCount}/{households.length} households</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by street or name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
        renderItem={renderHousehold}
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