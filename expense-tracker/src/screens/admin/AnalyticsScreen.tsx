import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import styles from '../../styles/AnalyticsStyle';

const DAYS = 5;

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState({
    logins: Array(DAYS).fill(0),
    featureUsage: [0, 0, 0], // [categories, expenses, budgets]
  });

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const calculateLogins = async () => {
    try {
      const storedLogins = await AsyncStorage.getItem('loginTimestamps');
      const timestamps: string[] = storedLogins ? JSON.parse(storedLogins) : [];

      const today = new Date();
      const dailyCounts = Array(DAYS).fill(0);

      timestamps.forEach((ts) => {
        const loginDate = new Date(ts);
        const diffDays = Math.floor((today.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < DAYS) {
          dailyCounts[DAYS - diffDays - 1] += 1;
        }
      });

      const categoriesRaw = await AsyncStorage.getItem('categories');
      const expensesRaw = await AsyncStorage.getItem('expenses');
      const budgetsRaw = await AsyncStorage.getItem('budgets');

      const categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];
      const parsedExpenses = expensesRaw ? JSON.parse(expensesRaw) : [];
      const parsedBudgets = budgetsRaw ? JSON.parse(budgetsRaw) : [];

      setExpenses(parsedExpenses);
      setBudgets(parsedBudgets);

      setAnalyticsData({
        logins: dailyCounts,
        featureUsage: [
          categories.length,
          parsedExpenses.length,
          parsedBudgets.length,
        ],
      });
    } catch (error) {
      console.error('Failed to calculate analytics:', error);
    }
  };

  useEffect(() => {
    calculateLogins();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AnalyticsDashboard analyticsData={analyticsData} />
      <Button title="Refresh Analytics" onPress={calculateLogins} color="#006400" />
    </ScrollView>
  );
};

export default AnalyticsScreen;
