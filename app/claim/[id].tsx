import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Claim } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../constants/colors';

export default function ClaimDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClaim(data);
    } catch (error) {
      console.error('Error fetching claim details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={globalStyles.centered}>
        <Text style={styles.errorText}>Claim not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Claim Details</Text>
        <Button title="← Back" onPress={() => router.back()} variant="secondary" />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Territory Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Area Claimed:</Text>
          <Text style={styles.value}>{claim.claimed_area.toFixed(0)} m²</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(claim.created_at)}</Text>
        </View>
        {claim.captured_from && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Captured From:</Text>
            <Text style={styles.value}>Player {claim.captured_from.slice(0, 8)}...</Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Claim Statistics</Text>
        <View style={globalStyles.statsContainer}>
          <View style={globalStyles.statItem}>
            <Text style={globalStyles.statValue}>{claim.coordinates.length}</Text>
            <Text style={globalStyles.statLabel}>Points</Text>
          </View>
          <View style={globalStyles.statItem}>
            <Text style={globalStyles.statValue}>
              {(claim.claimed_area / 1000).toFixed(1)}
            </Text>
            <Text style={globalStyles.statLabel}>km²</Text>
          </View>
          <View style={globalStyles.statItem}>
            <Text style={globalStyles.statValue}>
              {claim.captured_from ? '⚔️' : '🌱'}
            </Text>
            <Text style={globalStyles.statLabel}>
              {claim.captured_from ? 'Captured' : 'New'}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.coordinateText}>
          Territory ID: {claim.territory_id}
        </Text>
        <Text style={styles.coordinateText}>
          {claim.coordinates.length} coordinate points recorded
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
  },
  coordinateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});
