import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Wallet, TrendingUp, Building2, Plus, History, HandCoins } from 'lucide-react-native';
import { useWallet } from '@/contexts/WalletContext';

export default function DashboardScreen() {
  const { currentBalance, initialBalance, companyOwesYou, youOweCompany, isSettled, activeLoans, transactions } = useWallet();
  const router = useRouter();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Agent Finance Manager',
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceSection}>
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Wallet size={24} color="#fff" />
              <Text style={styles.cardTitle}>Wallet Summary</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Initial Balance</Text>
              <View style={styles.summaryAmounts}>
                <Text style={styles.summaryAmount}>
                  ${initialBalance.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.summaryAmountLBP}>
                  {initialBalance.lbp.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Balance</Text>
              <View style={styles.summaryAmounts}>
                <Text style={styles.summaryAmount}>
                  ${currentBalance.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.summaryAmountLBP}>
                  {currentBalance.lbp.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {isSettled ? (
              <View style={styles.settledCard}>
                <Text style={styles.settledText}>✓ Settled</Text>
                <Text style={styles.settledSubtext}>All accounts are balanced</Text>
              </View>
            ) : companyOwesYou.usd > 0 || companyOwesYou.lbp > 0 ? (
              <View style={styles.debtStatusCard}>
                <Text style={styles.debtStatusLabel}>Company Owes You</Text>
                <View style={styles.debtStatusAmounts}>
                  {companyOwesYou.usd > 0 && (
                    <Text style={styles.debtStatusAmount}>
                      ${companyOwesYou.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  )}
                  {companyOwesYou.lbp > 0 && (
                    <Text style={styles.debtStatusAmountLBP}>
                      {companyOwesYou.lbp.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.debtStatusCard}>
                <Text style={styles.debtStatusLabel}>You Owe Company</Text>
                <View style={styles.debtStatusAmounts}>
                  {youOweCompany.usd > 0 && (
                    <Text style={styles.debtStatusAmount}>
                      ${youOweCompany.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  )}
                  {youOweCompany.lbp > 0 && (
                    <Text style={styles.debtStatusAmountLBP}>
                      {youOweCompany.lbp.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.loansCard}>
            <View style={styles.cardHeader}>
              <HandCoins size={24} color="#fff" />
              <Text style={styles.cardTitle}>Active Loans</Text>
            </View>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceCurrency}>USD</Text>
                <Text style={styles.loansAmount}>
                  ${activeLoans.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceCurrency}>LBP</Text>
                <Text style={styles.loansAmount}>
                  {activeLoans.lbp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/transactions')}
            >
              <Plus size={28} color="#fff" />
              <Text style={styles.actionButtonText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push('/history')}
            >
              <History size={28} color="#fff" />
              <Text style={styles.actionButtonText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <TrendingUp size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first transaction to get started</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionDescription} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    {transaction.amountUSD > 0 && (
                      <Text style={styles.transactionAmount}>
                        ${transaction.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    )}
                    {transaction.amountLBP > 0 && (
                      <Text style={styles.transactionAmountLBP}>
                        {transaction.amountLBP.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  balanceSection: {
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
  },
  summaryAmounts: {
    alignItems: 'flex-end',
  },
  summaryAmount: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700' as const,
  },
  summaryAmountLBP: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  settledCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  settledText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  settledSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  debtStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  debtStatusLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  debtStatusAmounts: {
    alignItems: 'flex-start',
  },
  debtStatusAmount: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700' as const,
  },
  debtStatusAmountLBP: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  loansCard: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600' as const,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceCurrency: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  balanceAmount: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700' as const,
  },
  debtAmount: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700' as const,
  },
  loansAmount: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700' as const,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600' as const,
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flex: 1,
    marginRight: 12,
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
