import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface User {
  id: string;
  username: string;
  email: string;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Accounts</Text>
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No accounts found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id || item.email} // fallback to email if id is missing
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userText}>Name: {item.username}</Text>
              <Text style={styles.userText}>Email: {item.email}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    fontSize: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserList;
