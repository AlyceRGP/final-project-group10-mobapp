import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';

const DARK_GREEN = '#006400';
const screenWidth = Dimensions.get('window').width;

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
};

type Budget = {
  category: string;
  amount: number;
  startDate: string;
  endDate: string;
};

type ChartItem = {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

const generateColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count;
    return `hsl(${hue}, 60%, 70%)`;
  });
};

const HomeScreen = () => {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const storedExpenses = await AsyncStorage.getItem('expenses');
          const storedBudgets = await AsyncStorage.getItem('budgets');

          const parsedExpenses: Expense[] = storedExpenses ? JSON.parse(storedExpenses) : [];
          const parsedBudgets: Budget[] = storedBudgets ? JSON.parse(storedBudgets) : [];

          setExpenses(parsedExpenses);
          setBudgets(parsedBudgets);

          const grouped = parsedExpenses.reduce<Record<string, number>>((acc, expense) => {
            const category = expense.category || 'Other';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
          }, {});

          const keys = Object.keys(grouped);
          const dynamicColors = generateColors(keys.length);

          const data = keys.map((key, index) => ({
            name: key,
            amount: grouped[key],
            color: dynamicColors[index],
            legendFontColor: '#333',
            legendFontSize: 14,
          }));

          setChartData(data);
        } catch (error) {
          console.warn('Failed to load data', error);
        }
      };

      loadData();
    }, [])
  );

  const getBudgetForCategory = (category: string): number | null => {
    const now = new Date();
    const exact = budgets.find(
      (b) =>
        b.category === category &&
        new Date(b.startDate) <= now &&
        new Date(b.endDate) >= now
    );
    return exact ? exact.amount : null;
  };

  const getOverallBudget = (): number | null => {
    return getBudgetForCategory('Overall');
  };

  const getTotalExpenses = (): number => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChartItem>) => {
    const budget = getBudgetForCategory(item.name);
    const overBudget = budget !== null && item.amount > budget;
    const progress = budget !== null ? Math.min(item.amount / budget, 1) : 0;

    return (
      <View style={styles.itemBlock}>
        <View style={styles.itemRow}>
          <View style={[styles.colorBox, { backgroundColor: item.color }]} />
          <Text style={styles.itemText}>
            {item.name}: ₱{item.amount.toFixed(2)}{' '}
            {budget !== null && (
              <Text style={{ color: overBudget ? 'red' : 'green' }}>
                of ₱{budget.toFixed(2)} {overBudget ? '🚨 Over' : '✓'}
              </Text>
            )}
          </Text>
        </View>

        {budget !== null && (
          <Progress.Bar
            progress={progress}
            width={screenWidth * 0.8}
            height={10}
            color={overBudget ? 'red' : DARK_GREEN}
            unfilledColor="#e0e0e0"
            borderWidth={0}
            style={{ marginVertical: 4 }}
          />
        )}
      </View>
    );
  };

  const overallBudget = getOverallBudget();
  const totalSpent = getTotalExpenses();
  const overallProgress = overallBudget ? Math.min(totalSpent / overallBudget, 1) : 0;
  const isOverAllOver = overallBudget !== null && totalSpent > overallBudget;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Expense Breakdown</Text>

      {overallBudget !== null && (
        <View style={styles.overallBudgetContainer}>
          <Text style={styles.overallText}>
            Overall: ₱{totalSpent.toFixed(2)} of ₱{overallBudget.toFixed(2)}{' '}
            <Text style={{ color: isOverAllOver ? 'red' : 'green' }}>
              {isOverAllOver ? '🚨 Over' : '✓'}
            </Text>
          </Text>
          <Progress.Bar
            progress={overallProgress}
            width={screenWidth * 0.8}
            height={12}
            color={isOverAllOver ? 'red' : DARK_GREEN}
            unfilledColor="#e0e0e0"
            borderWidth={0}
            style={{ marginBottom: 16 }}
          />
        </View>
      )}

      {chartData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={screenWidth * 0.9}
              height={300}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="90"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                decimalPlaces: 2,
              }}
              hasLegend={false}
            />
          </View>

          <FlatList
            data={chartData}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <Text style={styles.noDataText}>No expenses yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GREEN,
    marginBottom: 15,
    textAlign: 'center',
  },
  overallBudgetContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  overallText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  noDataText: {
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: 20,
    alignItems: 'center',
  },
  itemBlock: {
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 10,
    borderRadius: 3,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;
