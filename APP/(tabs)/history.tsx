import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { useWallet } from '@/contexts/WalletContext';
import { TRANSACTION_LABELS } from '@/constants/types';
import type { TransactionType } from '@/constants/types';

export default function HistoryScreen() {
  const { transactions } = useWallet();
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const transactionTypes: (TransactionType | 'all')[] = [
    'all',
    'receive_customer',
    'pay_customer',
    'commission',
    'personal_withdrawal',
    'capital_deposit',
    'promo_receipt',
    'external_loan_received',
    'external_loan_repayment',
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Transaction History',
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Filter size={20} color="#1F2937" />
          <Text style={styles.filterTitle}>Filter by Type</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {transactionTypes.map((type) => {
            const isSelected = filterType === type;
            const label = type === 'all' 
              ? { en: 'All', ar: 'الكل', color: '#6B7280' }
              : TRANSACTION_LABELS[type];
            
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  isSelected && { backgroundColor: label.color, borderColor: label.color },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextSelected,
                  ]}
                >
                  {label.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsText}>
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterType === 'all' 
                ? 'Add your first transaction to get started'
                : 'No transactions of this type'}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction) => {
              const label = TRANSACTION_LABELS[transaction.type];
              return (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionHeader}>
                      <View style={[styles.typeBadge, { backgroundColor: label.color }]}>
                        <Text style={styles.typeBadgeText}>{label.en}</Text>
                      </View>
                    </View>
                    <Text style={styles.transactionDescription} numberOfLines={2}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    {transaction.amountUSD > 0 && (
                      <Text style={styles.transactionAmount}>
                        ${transaction.amountUSD.toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </Text>
                    )}
                    {transaction.amountLBP > 0 && (
                      <Text style={styles.transactionAmountLBP}>
                        {transaction.amountLBP.toLocaleString('en-US', { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0 
                        })} ل.ل
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  filterButtonTextSelected: {
    color: '#fff',
  },
  statsSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flex: 1,
    marginRight: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'uppercase',
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  transactionAmountLBP: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
