import { View, Text, Button, Alert } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Add logout logic
    Alert.alert('Logout', 'You have been logged out!');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default ProfileScreen;
