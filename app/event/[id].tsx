import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
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
  max_attendees: number | null;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState('1');

  React.useEffect(() => {
    if (id) loadEvent(id);
  }, [id]);

  async function loadEvent(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      setEvent(data);
    } catch (err) {
      Alert.alert('Error', 'Event not found');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleRSVP() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      Alert.alert('Error', 'Please enter email or phone number');
      return;
    }

    setRsvping(true);

    try {
      // Insert RSVP
      const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .insert([{
          event_id: id,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          attending: parseInt(attending) || 1,
        }]);

      if (rsvpError) throw rsvpError;

      // Update RSVP count
      const { error: updateError } = await supabase
        .rpc('increment_rsvp_count', { event_id: id, count: parseInt(attending) || 1 });

      // If the RPC doesn't exist, we can update manually
      if (updateError) {
        await supabase
          .from('events')
          .update({ rsvp_count: (event?.rsvp_count || 0) + (parseInt(attending) || 1) })
          .eq('id', id);
      }

      Alert.alert('RSVP Sent!', `You're registered for ${event?.title}. See you there!`);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit RSVP');
    } finally {
      setRsvping(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Event Details',
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

  if (!event) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Event Not Found',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.centered}>
          <Text>Event not found</Text>
        </View>
      </>
    );
  }

  const eventDate = new Date(event.date);
  const spotsLeft = event.max_attendees ? event.max_attendees - event.rsvp_count : null;

  return (
    <>
      <Stack.Screen 
        options={{
          title: event.title,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        {/* Event Header */}
        <View style={styles.header}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateMonth}>
              {eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </Text>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
            <Text style={styles.dateYear}>{eventDate.getFullYear()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>
              🕐 {event.time}{'\n'}
              📍 {event.location}
            </Text>
          </View>
        </View>

        {/* Attendance Count */}
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceNumber}>{event.rsvp_count}</Text>
            <Text style={styles.attendanceLabel}>ATTENDING</Text>
          </View>
          {spotsLeft !== null && (
            <>
              <View style={styles.attendanceDivider} />
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceNumber}>{spotsLeft}</Text>
                <Text style={styles.attendanceLabel}>SPOTS LEFT</Text>
              </View>
            </>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* RSVP Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RSVP</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PHONE</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NUMBER ATTENDING</Text>
            <TextInput
              style={styles.input}
              placeholder="How many people?"
              value={attending}
              onChangeText={setAttending}
              keyboardType="number-pad"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <Text style={styles.note}>
            Email or phone required so we can notify you of any changes.
          </Text>

          <TouchableOpacity 
            style={styles.rsvpButton}
            onPress={handleRSVP}
            disabled={rsvping}
          >
            {rsvping ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.rsvpButtonText}>CONFIRM RSVP</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 20,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
  },
  dateMonth: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  dateDay: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    color: '#fff',
  },
  dateYear: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  attendanceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  attendanceNumber: {
    fontFamily: Fonts.headline,
    fontSize: 36,
    color: Colors.primary,
  },
  attendanceLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  attendanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  note: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rsvpButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
});