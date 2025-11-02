import React, { useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useGame } from '../../contexts/GameContext';
import { ActivityItem } from '../../components/ActivityItem';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';

export default function ActivityScreen() {
  const { state, fetchActivities } = useGame();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Recent Activity</Text>
        <Text style={globalStyles.caption}>Your claims and nearby events</Text>
      </View>

      {state.activities.length === 0 ? (
        <View style={globalStyles.centered}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Activity Yet</Text>
          <Text style={styles.emptyText}>
            Start tracking and claim your first territory to see activity here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityItem activity={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
