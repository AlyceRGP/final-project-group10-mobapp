//profile
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, User } from '../../../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  setUser: (user: User | null) => void;
}

const DARK_GREEN = '#006400';

const defaultCategories = ['Food', 'Bills', 'Transport', 'Entertainment', 'Other'];

const ProfileScreen: React.FC<Props> = ({ navigation, setUser }) => {
  const [username, setUsername] = useState('bob');
  const [email, setEmail] = useState('bob@example.com');
  const [categories, setCategories] = useState<string[]>(defaultCategories);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('username');
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedName) setUsername(storedName);
        if (storedCategories) setCategories(JSON.parse(storedCategories));
      } catch (err) {
        console.warn('Failed to load data');
      }
    };
    loadData();
  }, []);

  const saveUsername = async () => {
    try {
      await AsyncStorage.setItem('username', newUsername);
      setUsername(newUsername);
      setModalVisible(false);
      setIsEditingUsername(false);
    } catch (err) {
      alert('Failed to save username');
    }
  };

  const saveCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      alert('Category name cannot be empty.');
      return;
    }

    const nameExists = categories.some(
      (cat) =>
        cat.toLowerCase() === trimmedName.toLowerCase() &&
        cat !== editingCategory 
    );

    if (nameExists) {
      alert('Category name already exists.');
      return;
    }

    try {
      let updatedCategories;
      if (editingCategory) {
        // Edit existing category
        updatedCategories = categories.map((cat) =>
          cat === editingCategory ? trimmedName : cat
        );

        // Update category name in all expenses
          const expensesData = await AsyncStorage.getItem('expenses');
          const expenses = expensesData ? JSON.parse(expensesData) : [];

          const updatedExpenses = expenses.map((expense: any) =>
            expense.category === editingCategory
              ? { ...expense, category: trimmedName }
              : expense
          );

          await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      } else {
        // Add new category
        updatedCategories = [...categories, trimmedName];
      }

      setCategories(updatedCategories);
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));

      setEditingCategory(null);
      setNewCategoryName('');
      setIsCategoryModalVisible(false);
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const deleteCategory = (categoryToDelete: string) => {
  Alert.alert(
    'Confirm Deletion',
    `Are you sure you want to delete the category "${categoryToDelete}"? This will delete all your expenses added under it.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Remove the category from list
            const updatedCategories = categories.filter((cat) => cat !== categoryToDelete);
            setCategories(updatedCategories);
            await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));

            // Remove related expenses
            const expensesData = await AsyncStorage.getItem('expenses');
            const expenses = expensesData ? JSON.parse(expensesData) : [];
            const filteredExpenses = expenses.filter(
              (expense: any) => expense.category !== categoryToDelete
            );
            await AsyncStorage.setItem('expenses', JSON.stringify(filteredExpenses));
          } catch (err) {
            alert('Failed to delete category and related expenses.');
          }
        },
      },
    ]
  );
};



  const renderCategoryItem = ({ item }: { item: string }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            setEditingCategory(item);
            setNewCategoryName(item);
            setIsCategoryModalVisible(true);
          }}
          style={styles.editButton}
        >
          <Ionicons name="pencil" size={22} color={DARK_GREEN} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteCategory(item)} style={styles.deleteButton}>
          <Ionicons name="trash" size={22} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('currentUser');
              setUser(null);
            } catch (error) {
              alert('Failed to log out.');
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.usernameContainer}>
          <Text style={styles.value}>{username}</Text>
          <TouchableOpacity
            onPress={() => {
              setNewUsername(username);
              setIsEditingUsername(true);
              setModalVisible(true);
            }}
            style={styles.editIconContainer}
          >
            <Ionicons name="pencil" size={22} color={DARK_GREEN} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        <Text style={styles.label}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item, index) => index.toString()}
        />

        <TouchableOpacity
          style={styles.addCategoryButton}
          onPress={() => {
            setEditingCategory(null);
            setNewCategoryName('');
            setIsCategoryModalVisible(true);
          }}
        >
          <Text style={styles.addCategoryButtonText}>+ Add Category</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addCategoryButton, { backgroundColor: '#aaaaaa', marginTop: 10 }]}
          onPress={handleLogout}
        >
          <Text style={styles.addCategoryButtonText}>Log Out</Text>
        </TouchableOpacity>

      </View>

      {/* Username Modal */}
      <Modal
        visible={modalVisible && isEditingUsername}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setIsEditingUsername(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setIsEditingUsername(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveUsername} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsCategoryModalVisible(false);
          setEditingCategory(null);
          setNewCategoryName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </Text>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setIsCategoryModalVisible(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCategory} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: DARK_GREEN,
    marginBottom: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    color: DARK_GREEN,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIconContainer: {
    marginRight: 25,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryText: {
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: DARK_GREEN,
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: DARK_GREEN,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: DARK_GREEN,
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
