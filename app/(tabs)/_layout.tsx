import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pay-dues"
        options={{
          title: 'Pay Dues',
          tabBarIcon: ({ color }) => <TabIcon emoji="💰" color={color} />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: 'Membership',
          tabBarIcon: ({ color }) => <TabIcon emoji="🎫" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color }) => <TabIcon emoji="✉️" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <Text style={styles.emoji}>{emoji}</Text>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: Fonts.body,
  },
  emoji: {
    fontSize: 22,
  },
});