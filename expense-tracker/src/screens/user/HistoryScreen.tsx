//expenses
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface Expense {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  category: string;
}

const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Online'];

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
});

const HistoryScreen = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const loadData = async () => {
  try {
    const expensesData = await AsyncStorage.getItem('expenses');
    const parsedExpenses = expensesData ? JSON.parse(expensesData) : [];

    const categoriesData = await AsyncStorage.getItem('categories');
    const parsedCategories = categoriesData ? JSON.parse(categoriesData) : [];

    setExpenses(parsedExpenses.reverse());
    setCategories(parsedCategories);
  } catch (err) {
    console.error('Failed to load data', err);
  } finally {
    setLoading(false);
  }
};


  useFocusEffect(
  useCallback(() => {
    setLoading(true);
    loadData();
  }, [])
);


  const handleDelete = (id: string) => {
    Alert.alert('Confirm', 'Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = expenses.filter((e) => e.id !== id);
            setExpenses(updated);
            await AsyncStorage.setItem('expenses', JSON.stringify([...updated].reverse()));
          } catch (err) {
            console.error('Delete failed', err);
          }
        },
      },
    ]);
  };

  const handleEdit = (item: Expense) => {
    setEditingExpense(item);
    setModalVisible(true);
  };

  const handleUpdateExpense = async (values: any) => {
    if (!editingExpense) return;

    const updatedExpense: Expense = {
      ...editingExpense,
      amount: parseFloat(values.amount),
      date: values.date.toISOString(),
      category: values.category,
      paymentMethod: values.paymentMethod,
    };

    const updatedList = expenses.map((exp) =>
      exp.id === editingExpense.id ? updatedExpense : exp
    );

    setExpenses(updatedList);
    await AsyncStorage.setItem('expenses', JSON.stringify([...updatedList].reverse()));
    setModalVisible(false);
    setEditingExpense(null);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
        <Text style={styles.details}>
          {new Date(item.date).toLocaleDateString()} • {item.category} • {item.paymentMethod}
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
      <Text style={styles.heading}>Your Expenses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#006400" />
      ) : expenses.length === 0 ? (
        <Text style={styles.noDataText}>No expenses yet.</Text>
      ) : (
        <FlatList data={expenses} keyExtractor={(item) => item.id} renderItem={renderItem} showsVerticalScrollIndicator={false}/>
      )}

      {/* Edit Modal */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {editingExpense && (
              <Formik
                initialValues={{
                  amount: editingExpense.amount.toString(),
                  date: new Date(editingExpense.date),
                  category: editingExpense.category,
                  paymentMethod: editingExpense.paymentMethod,
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdateExpense}
              >
                {({ handleChange, handleSubmit, values, setFieldValue, errors, touched }) => (
                  <>
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

                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>{values.date.toDateString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={values.date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            setFieldValue('date', selectedDate);
                          }
                          setShowDatePicker(false);
                        }}
                      />
                    )}

                    <Text style={styles.label}>Payment Method</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={values.paymentMethod}
                        onValueChange={(itemValue) => setFieldValue('paymentMethod', itemValue)}
                      >
                        {paymentMethods.map((method) => (
                          <Picker.Item key={method} label={method} value={method} />
                        ))}
                      </Picker>
                    </View>

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={values.category}
                        onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                      >
                        {categories.map((cat) => (
                          <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                      </Picker>
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
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
    textAlign: 'center'
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
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

export default HistoryScreen;
