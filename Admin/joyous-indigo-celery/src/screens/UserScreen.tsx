import React, { useState } from 'react';
import {View,Button,ScrollView,TextInput,Alert,Modal,TouchableOpacity,Text,} from 'react-native';
import UserList from '../components/UserList';
import styles from '../styles/UserAdminStyle'; 

interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
}

const UserScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addUser = () => {
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
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      lastLogin: new Date().toLocaleString(),
    };

    setUsers((prevUsers) => [...prevUsers, newUser]);

    setName('');
    setEmail('');
    setModalVisible(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <UserList users={users} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
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
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={addUser} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UserScreen;
