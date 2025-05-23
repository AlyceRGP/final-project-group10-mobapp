import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, User } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
  setUser: (user: User) => void;
}

const ADMIN_CREDENTIALS: User = {
  email: 'admin1@email.com',
  password: 'admin1Pass',
  username: 'admin1',
  role: 'admin',
};


const LoginScreen: React.FC<Props> = ({ navigation, setUser }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  

  const handleLogin = async () => {
  try {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username/email and password');
      return;
    }

    setIsLoading(true);

    if (
      (identifier.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() ||
       identifier.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase()) &&
      password === ADMIN_CREDENTIALS.password
    ) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(ADMIN_CREDENTIALS));
      setUser(ADMIN_CREDENTIALS);
      return;
    }

    const usersString = await AsyncStorage.getItem('registeredUsers');
    if (!usersString) {
      Alert.alert('Error', 'No users found. Please register first.');
      return;
    }

    const users: User[] = JSON.parse(usersString);
    const user = users.find(u => 
      u.username.toLowerCase() === identifier.toLowerCase() || 
      u.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      Alert.alert('Error', 'User not found. Please check your credentials.');
      return;
    }

    if (user.password !== password) {
      Alert.alert('Error', 'Incorrect password. Please try again.');
      return;
    }

    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    setUser(user);
    await recordLogin();
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'Failed to login. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

const recordLogin = async () => {
  try {
    const storedLogins = await AsyncStorage.getItem('loginTimestamps');
    const loginArray = storedLogins ? JSON.parse(storedLogins) : [];
    const updatedLogins = [...loginArray, new Date().toISOString()];
    await AsyncStorage.setItem('loginTimestamps', JSON.stringify(updatedLogins));
  } catch (error) {
    console.error('Failed to record login:', error);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#006400" />
      ) : (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
        disabled={isLoading}
      >
        <Text style={styles.registerText}>Create new account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    backgroundColor: '#006400',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 10,
  },
  registerText: {
    textAlign: 'center',
    color: '#006400',
  },
});

export default LoginScreen;