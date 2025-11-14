import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeaderboardEntry } from '../types';
import { colors } from '../constants/colors';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  currentUserName?: string;
}

export function LeaderboardItem({ entry, currentUserName }: LeaderboardItemProps) {
  const isCurrentUser = entry.user_name === currentUserName;

  const getRankIcon = (rank?: number) => {
    if (!rank) return '#-';
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.highlighted]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{getRankIcon(entry.rank)}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{entry.user_name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
          {entry.user_name}
          {isCurrentUser && ' (You)'}
        </Text>
        <Text style={styles.stats}>
          {(entry.total_area / 1000000).toFixed(2)} km²
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  highlighted: {
    backgroundColor: colors.surface,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  currentUserText: {
    color: colors.primary,
  },
  stats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
