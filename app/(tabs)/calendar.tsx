import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  rsvp_count: number;
}

export default function CalendarScreen() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Calendar of Events',
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
          title: 'Calendar of Events',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        {events.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>NO UPCOMING EVENTS</Text>
            <Text style={styles.emptyText}>
              Check back soon for community events, cleanups, and gatherings!
            </Text>
          </View>
        ) : (
          events.map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/event/${event.id}` as never)}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventMonth}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={styles.eventDay}>
                  {new Date(event.date).getDate()}
                </Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  🕐 {event.time} • 📍 {event.location}
                </Text>
                <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                <View style={styles.eventFooter}>
                  <Text style={styles.rsvpCount}>
                    {event.rsvp_count || 0} attending
                  </Text>
                  <Text style={styles.tapToRsvp}>Tap to RSVP →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
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
    backgroundColor: Colors.background,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventDate: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  eventMonth: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  eventDay: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    color: '#fff',
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventTime: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  eventDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rsvpCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.primary,
  },
  tapToRsvp: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});