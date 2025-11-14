import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { LeaderboardEntry } from '../../types';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';
import { getLeaderboard } from '../../lib/api';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      
      // Add rank to each entry
      const leaderboardData: LeaderboardEntry[] = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>🏆 Leaderboard</Text>
        <Text style={globalStyles.caption}>Top territory conquerors</Text>
      </View>

      {loading ? (
        <View style={globalStyles.centered}>
          <Text>Loading...</Text>
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={globalStyles.centered}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyText}>
            Be the first to claim territory and top the leaderboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => `${item.user_name}-${index}`}
          renderItem={({ item }) => (
            <LeaderboardItem entry={item} currentUserName={user?.user_name} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
