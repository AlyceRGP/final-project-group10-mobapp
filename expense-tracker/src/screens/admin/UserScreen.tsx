import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import {
  View,
  FlatList,
  Text,
  Button,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/UserAdminStyle';

interface User {
  id: string;
  username: string;
  email: string;
  lastLogin: string;
}

const UserScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadUsers = async () => {
        try {
          const storedUsers = await AsyncStorage.getItem('registeredUsers');
          if (storedUsers) {
            const parsedUsers: User[] = JSON.parse(storedUsers);
            setUsers(parsedUsers);
          } else {
            setUsers([]);
          }
        } catch (error) {
          console.error('Failed to load users from AsyncStorage:', error);
        }
      };

      loadUsers();
    }, [])
  );

  const addUser = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const newUser: User = {
      id: uuid.v4().toString(),
      username: name.trim(),
      email: email.trim(),
      lastLogin: new Date().toLocaleString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    setName('');
    setEmail('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Accounts</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No accounts found</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>Name: {item.username}</Text>
            <Text style={styles.userText}>Email: {item.email}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add User</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#006400"/>
              <Button title="Add" onPress={addUser} color="#006400"/>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserScreen;
