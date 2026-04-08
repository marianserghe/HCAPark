import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: Fonts.headline,
          fontSize: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HCA Park',
          headerTitleStyle: { fontFamily: Fonts.headline, fontSize: 24 },
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitleStyle: { fontFamily: Fonts.headline, fontSize: 24 },
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pay-dues"
        options={{
          title: 'Pay Dues',
          headerTitleStyle: { fontFamily: Fonts.headline, fontSize: 24 },
          tabBarIcon: ({ color, size }) => (
            <Feather name="map-pin" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: 'Membership',
          headerTitleStyle: { fontFamily: Fonts.headline, fontSize: 24 },
          tabBarIcon: ({ color, size }) => (
            <Feather name="award" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          headerTitleStyle: { fontFamily: Fonts.headline, fontSize: 24 },
          tabBarIcon: ({ color, size }) => (
            <Feather name="mail" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    paddingBottom: 30,
    height: 80,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: Fonts.body,
  },
});