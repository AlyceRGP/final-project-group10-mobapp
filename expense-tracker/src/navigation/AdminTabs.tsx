import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserScreen from '../screens/admin/UserScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';

const Tab = createBottomTabNavigator();

const AdminTabs = ({ setUser }: { setUser: (user: User | null) => void }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Users" component={UserScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="AdminProfile" options={{ title: 'Profile' }}>
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AdminTabs;
