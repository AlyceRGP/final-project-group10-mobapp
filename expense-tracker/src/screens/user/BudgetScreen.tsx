import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';

const DARK_GREEN = '#006400';

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .test('different-date', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      return value && startDate && new Date(value) > new Date(startDate);
    }),
});

const BudgetScreen = () => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const resetFormRef = useRef<(() => void) | null>(null);

  const [categories, setCategories] = useState<string[]>(['Overall']);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCategories = async () => {
        try {
          const stored = await AsyncStorage.getItem('categories');
          const parsed = stored ? JSON.parse(stored) : [];
          setCategories(['Overall', ...parsed]); 
        } catch (err) {
          console.warn('Failed to load categories');
        }
      };
      fetchCategories();
    }, [])
  );

  const saveBudget = async (values: any, { resetForm }: FormikHelpers<any>) => {
    try {
      const existing = await AsyncStorage.getItem('budgets');
      const budgets = existing ? JSON.parse(existing) : [];

      const duplicate = budgets.find(
        (b: any) => b.category === values.category
      );

      if (duplicate) {
        alert(`A budget already exists for category "${values.category}."`);
        return;
      }

      const budget = {
        id: uuid.v4(),
        category: values.category,
        amount: parseFloat(values.amount),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      budgets.push(budget);
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
      alert('Budget saved!');
      resetForm();
    } catch (err) {
      alert('Failed to save budget.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (resetFormRef.current) {
        resetFormRef.current();
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set a Budget</Text>

      <Formik
        initialValues={{
          category: 'Overall',
          amount: '',
          startDate: new Date(),
          endDate: new Date(),
        }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => saveBudget(values, actions)}
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
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.category}
                  onValueChange={(value) => setFieldValue('category', value)}
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={values.amount}
                onChangeText={handleChange('amount')}
                placeholder="Enter budget amount"
              />
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}

              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{values.startDate.toDateString()}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={values.startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setFieldValue('startDate', selectedDate);
                    setShowStartPicker(false);
                  }}
                />
              )}
              {touched.startDate && errors.startDate && (
                <Text style={styles.errorText}>{String(errors.startDate)}</Text>
              )}

              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{values.endDate.toDateString()}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={values.endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setFieldValue('endDate', selectedDate);
                    setShowEndPicker(false);
                  }}
                />
              )}
              {touched.endDate && errors.endDate && (
                <Text style={styles.errorText}>{String(errors.endDate)}</Text>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.addButton}
                  labelStyle={{ color: 'white' }}
                >
                  Set Budget
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

export default BudgetScreen;
