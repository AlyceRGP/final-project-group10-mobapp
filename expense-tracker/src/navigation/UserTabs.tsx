import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/user/HomeScreen';
import AddScreen from '../screens/user/AddScreen';
import HistoryScreen from '../screens/user/HistoryScreen';
import BudgetScreen from '../screens/user/BudgetScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ViewBudgetScreen from '../screens/user/ViewBudgetScreen';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';

const Tab = createBottomTabNavigator();

const UserTabs = ({ setUser }: { setUser: (user: User | null) => void }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'UserHome':
              iconName = 'home';
              break;
            case 'Add':
              iconName = 'add-circle';
              break;
            case 'Expenses':
              iconName = 'list';
              break;
            case 'Budgets':
              iconName = 'pie-chart';
              break;
            case 'Set':
              iconName = 'create';
              break;
            case 'UserProfile':
              iconName = 'person';
              break;
            default:
              iconName = 'alert-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#006400',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="UserHome" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ title: 'Add Expense' }} />
      <Tab.Screen name="Expenses" component={HistoryScreen} />
      <Tab.Screen name="Budgets" component={ViewBudgetScreen} />
      <Tab.Screen name="Set" component={BudgetScreen} options={{ title: 'Set Budget' }} />
      <Tab.Screen name="UserProfile" options={{ title: 'Profile' }}> 
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default UserTabs;
