import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';
import { useHouseholds } from '@/lib/HouseholdsContext';
import { Household } from '@/lib/supabase';

type AdminTab = 'households' | 'events' | 'contact';

export default function AdminScreen() {
  const { households, loading, refresh, togglePaid, stats } = useHouseholds();
  const [activeTab, setActiveTab] = React.useState<AdminTab>('households');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'unpaid'>('all');
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = React.useState(false);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
      if (activeTab === 'contact') loadContacts();
    }, [refresh, activeTab])
  );

  async function loadContacts() {
    setContactsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  }

  async function handleTogglePaid(household: Household) {
    try {
      await togglePaid(household);
    } catch (err: any) {
      // Error handled by context
    }
  }

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

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerTitle: () => (
              <Text style={{ fontFamily: 'BebasNeue', fontSize: 24, color: '#fff', letterSpacing: 2 }}>
                ADMIN DASHBOARD
              </Text>
            ),
            headerTitleAlign: 'center',
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <Text style={{ fontFamily: 'BebasNeue', fontSize: 24, color: '#fff', letterSpacing: 2 }}>
              ADMIN DASHBOARD
            </Text>
          ),
          headerTitleAlign: 'center',
          headerBackTitle: '',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'households' && styles.tabActive]}
            onPress={() => setActiveTab('households')}
          >
            <Text style={[styles.tabText, activeTab === 'households' && styles.tabTextActive]}>
              HOUSEHOLDS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
            onPress={() => setActiveTab('contact')}
          >
            <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
              CONTACT
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'households' && (
          <>
            {/* Summary Stats */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>COLLECTED:</Text>
                <Text style={styles.summaryValue}>${stats.totalCollected.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>EXPECTED:</Text>
                <Text style={styles.summaryValue}>${stats.expectedTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: Colors.error }]}>OUTSTANDING:</Text>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>
                  ${(stats.expectedTotal - stats.totalCollected).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>PAID:</Text>
                <Text style={styles.summaryValue}>{stats.paidCount}/{stats.total} HOUSEHOLDS</Text>
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
                      {f.toUpperCase()}
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
          </>
        )}

        {activeTab === 'contact' && (
          contactsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No contact submissions yet</Text>
            </View>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.contactEmail}>{item.email}</Text>
                  <Text style={styles.contactMessage}>{item.message}</Text>
                  {item.status === 'new' && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
              )}
              contentContainerStyle={styles.list}
            />
          )
        )}
      </View>
    </>
  );
}

// Import supabase at the top
import { supabase } from '@/lib/supabase';

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
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontFamily: Fonts.regular,
  },
  summaryValue: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    letterSpacing: 1,
  },
  searchContainer: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 12,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontFamily: Fonts.regular,
  },
  filterTextActive: {
    color: '#fff',
    letterSpacing: 1,
  },
  list: {
    paddingVertical: 8,
  },
  householdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  householdInfo: {
    flex: 1,
  },
  address: {
    fontSize: 20,
    fontFamily: Fonts.regular,
    color: Colors.text,
    letterSpacing: 1,
  },
  name: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontFamily: Fonts.regular,
    fontSize: 18,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 1,
  },
  contactDate: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactEmail: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  contactMessage: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});