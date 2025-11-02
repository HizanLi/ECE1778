import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from '../types';
import { colors } from '../constants/colors';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'claim':
        return '🎉';
      case 'lost':
        return '⚠️';
      case 'defense':
        return '🛡️';
      default:
        return '📍';
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'claim':
        return colors.success;
      case 'lost':
        return colors.error;
      case 'defense':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getActivityColor() + '20' }]}>
        <Text style={styles.icon}>{getActivityIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.details}>
          {activity.area_change > 0 ? '+' : ''}
          {activity.area_change.toFixed(0)}m² • {formatDate(activity.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
