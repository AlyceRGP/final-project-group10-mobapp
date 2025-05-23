import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Accounts</Text> {/* You can remove this duplicate title now if you want */}
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No accounts found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text>{item.name}</Text>
              <Text>{item.email}</Text>
              <Text>Last Login: {item.lastLogin}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Remove marginTop here if you want, since UserScreen controls padding now
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
