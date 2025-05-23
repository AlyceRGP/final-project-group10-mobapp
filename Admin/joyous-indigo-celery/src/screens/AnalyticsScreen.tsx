import React, { useState } from 'react';
import { ScrollView, Button } from 'react-native';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import styles from '../styles/AnalyticsStyle';  // <-- adjust the path as needed

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState({
    logins: [0, 0, 0, 0, 0],
    featureUsage: [0, 0, 0, 0, 0],
  });

  const updateAnalytics = () => {
    setAnalyticsData({
      logins: analyticsData.logins.map((count) => count + 1),
      featureUsage: analyticsData.featureUsage.map(
        (count) => count + Math.floor(Math.random() * 10)
      ),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AnalyticsDashboard analyticsData={analyticsData} />
      <Button title="Update Analytics" onPress={updateAnalytics} />
    </ScrollView>
  );
};

export default AnalyticsScreen;
