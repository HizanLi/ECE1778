import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { LeaderboardEntry } from '../../types';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';

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
      const { data, error } = await supabase
        .from('users')
        .select('id, username, total_area, total_claims, avatar_url')
        .order('total_area', { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboardData: LeaderboardEntry[] = data.map((entry, index) => ({
        user_id: entry.id,
        username: entry.username,
        total_area: entry.total_area,
        total_claims: entry.total_claims,
        rank: index + 1,
        avatar_url: entry.avatar_url,
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
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <LeaderboardItem entry={item} currentUserId={user?.id} />
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
