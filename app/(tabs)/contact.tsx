import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';
import { supabase } from '@/lib/supabase';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{ name, email, message }]);

      if (error) throw error;

      Alert.alert('Message Sent', 'Thank you for reaching out! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Contact Us',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>GET IN TOUCH</Text>
          <Text style={styles.headerSubtitle}>
            Have questions or feedback? We'd love to hear from you.
          </Text>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEND A MESSAGE</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NAME</Text>
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
            <Text style={styles.inputLabel}>MESSAGE</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How can we help?"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>SEND MESSAGE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FOLLOW US</Text>
          
          <View style={styles.socialRow}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://facebook.com/hcapark')}
            >
              <Feather name="facebook" size={20} color={Colors.text} />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com/hcapark')}
            >
              <Feather name="instagram" size={20} color={Colors.text} />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT INFO</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="mail" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>contact@hcapark.org</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>Waldwick, NJ 07463</Text>
            </View>
          </View>
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
  header: {
    padding: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
});