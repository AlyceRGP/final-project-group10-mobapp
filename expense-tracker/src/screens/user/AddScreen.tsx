import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useFocusEffect } from '@react-navigation/native';

const DARK_GREEN = '#006400';
const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Online'];

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
});

const AddScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const resetFormRef = useRef<(() => void) | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCategories = async () => {
        try {
          const stored = await AsyncStorage.getItem('categories');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setCategories(parsed);
            }
          } else {
            setCategories(['Food', 'Bills', 'Transport', 'Entertainment', 'Other']);
          }
        } catch (error) {
          console.warn('Failed to load categories');
        }
      };

      fetchCategories();

      if (resetFormRef.current) {
        resetFormRef.current(); 
        setDate(new Date());    
      }
    }, [])
  );

  const handleAddExpense = async (
    values: any,
    { resetForm }: FormikHelpers<any>
  ) => {
    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(values.amount),
      date: date.toISOString(),
      paymentMethod: values.paymentMethod,
      category: values.category,
    };

    try {
      const existing = await AsyncStorage.getItem('expenses');
      const expenses = existing ? JSON.parse(existing) : [];
      expenses.push(newExpense);
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
      alert('Expense added!');
      resetForm();
      setDate(new Date());
    } catch (error) {
      alert('Failed to save expense.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add an Expense</Text>

      <Formik
        enableReinitialize
        initialValues={{
          amount: '',
          paymentMethod: paymentMethods[0],
          category: categories[0] || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleAddExpense}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          resetForm,
        }) => {
          resetFormRef.current = resetForm;

          return (
            <>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={values.amount}
                onChangeText={handleChange('amount')}
                placeholder="Enter amount"
              />
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{date.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setDate(selectedDate);
                    setShowDatePicker(false);
                  }}
                />
              )}

              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.paymentMethod}
                  onValueChange={(itemValue) =>
                    setFieldValue('paymentMethod', itemValue)
                  }
                  style={styles.picker}
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
                  onValueChange={(itemValue) =>
                    setFieldValue('category', itemValue)
                  }
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.addButton}
                  labelStyle={{ color: 'white' }}
                >
                  Add Expense
                </Button>
              </View>
            </>
          );
        }}
      </Formik>
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
    marginBottom: 10,
    color: DARK_GREEN,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    color: DARK_GREEN,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  addButton: {
    backgroundColor: DARK_GREEN,
    width: 180,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});

export default AddScreen;
