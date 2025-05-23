import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface Budget {
  id: string;
  category: string;
  amount: number;
  startDate: string;
  endDate: string;
}

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
});

const ViewBudgetScreen = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const loadBudgets = async () => {
    const data = await AsyncStorage.getItem('budgets');
    const parsed = data ? JSON.parse(data) : [];
    setBudgets(parsed.reverse());
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBudgets();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm', 'Delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = budgets.filter((b) => b.id !== id);
          setBudgets(updated);
          await AsyncStorage.setItem('budgets', JSON.stringify([...updated].reverse()));
        },
      },
    ]);
  };

  const handleEdit = (item: Budget) => {
    setEditingBudget(item);
    setModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingBudget) return;

    const updated = {
      ...editingBudget,
      amount: parseFloat(values.amount),
    };

    const newList = budgets.map((b) => (b.id === editingBudget.id ? updated : b));
    setBudgets(newList);
    await AsyncStorage.setItem('budgets', JSON.stringify([...newList].reverse()));
    setModalVisible(false);
    setEditingBudget(null);
  };

  const renderItem = ({ item }: { item: Budget }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.amount}>₱{Number(item.amount || 0).toFixed(2)}</Text>
        <Text style={styles.details}>
          {item.category} • {new Date(item.startDate).toLocaleDateString()} -{' '}
          {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
          <Ionicons name="pencil" size={22} color="#006400" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <Ionicons name="trash" size={22} color="#006400" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Budgets</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#006400" />
      ) : budgets.length === 0 ? (
        <Text style={styles.noDataText}>No budgets yet.</Text>
      ) : (
        <FlatList data={budgets} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}

      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {editingBudget && (
              <Formik
                initialValues={{
                  amount: editingBudget.amount.toString(),
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdate}
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    <Text style={styles.modalTitle}>
                      Edit budget for {editingBudget.category}
                    </Text>

                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={values.amount}
                      onChangeText={handleChange('amount')}
                    />
                    {touched.amount && errors.amount && (
                      <Text style={styles.errorText}>{errors.amount}</Text>
                    )}

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible(false);
                          setEditingBudget(null);
                        }}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleSubmit()} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 15,
    textAlign: 'center',
  },
  noDataText: {
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  iconButton: {
    paddingHorizontal: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#006400',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#006400',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ViewBudgetScreen;
