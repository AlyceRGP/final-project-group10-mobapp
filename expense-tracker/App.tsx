import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AdminTabs from './src/navigation/AdminTabs';
import UserTabs from './src/navigation/UserTabs';
import { createStackNavigator } from '@react-navigation/stack';
import { User } from './types';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';

const Stack = createStackNavigator();

export default function App() {

  const [user, setUser] = useState<User | null>(null);

  return (
    <SafeAreaView style={styles.container}>
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Home">
              {() => user.role === 'admin'
                ? <AdminTabs setUser={setUser} />
                : <UserTabs setUser={setUser} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                options={{
                  headerShown: true,
                  title: 'Create Account',
                  headerStyle: { backgroundColor: '#f5f5f5' },
                  headerTintColor: '#006400',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
});