import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { User } from '../../../types';

type Props = {
  setUser: (user: User | null) => void;
};

const ProfileScreen: React.FC<Props> = ({ setUser }) => {
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => setUser(null)
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} color="#006400" />
    </View>
  );
};

export default ProfileScreen;
