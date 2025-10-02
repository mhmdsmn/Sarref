import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { HandCoins, Plus, DollarSign, X } from 'lucide-react-native';
import { useWallet } from '@/contexts/WalletContext';

export default function LoansScreen() {
  const { loans, activeLoans, addLoan, repayLoan, addTransaction } = useWallet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');

  const [lenderName, setLenderName] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLBP, setAmountLBP] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [repayAmountUSD, setRepayAmountUSD] = useState('');
  const [repayAmountLBP, setRepayAmountLBP] = useState('');

  const activeLoansData = loans.filter(loan => loan.status === 'active');
  const repaidLoansData = loans.filter(loan => loan.status === 'repaid');

  const handleAddLoan = () => {
    const usd = parseFloat(amountUSD) || 0;
    const lbp = parseFloat(amountLBP) || 0;

    if (usd === 0 && lbp === 0) {
      Alert.alert('Error', 'Please enter at least one amount');
      return;
    }

    if (!lenderName.trim()) {
      Alert.alert('Error', 'Please enter lender name');
      return;
    }

    addLoan({
      lenderName: lenderName.trim(),
      amountUSD: usd,
      amountLBP: lbp,
      remainingUSD: usd,
      remainingLBP: lbp,
      status: 'active',
      dateBorrowed: date,
    });

    addTransaction({
      type: 'external_loan_received',
      amountUSD: usd,
      amountLBP: lbp,
      description: `Borrowed from ${lenderName.trim()}`,
      date,
    });

    setLenderName('');
    setAmountUSD('');
    setAmountLBP('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);

    Alert.alert('Success', 'Loan added successfully');
  };

  const handleRepayLoan = () => {
    const usd = parseFloat(repayAmountUSD) || 0;
    const lbp = parseFloat(repayAmountLBP) || 0;

    if (usd === 0 && lbp === 0) {
      Alert.alert('Error', 'Please enter at least one amount');
      return;
    }

    const loan = loans.find(l => l.id === selectedLoanId);
    if (!loan) {
      Alert.alert('Error', 'Loan not found');
      return;
    }

    if (usd > loan.remainingUSD || lbp > loan.remainingLBP) {
      Alert.alert('Error', 'Repayment amount exceeds remaining loan balance');
      return;
    }

    repayLoan(selectedLoanId, usd, lbp);

    addTransaction({
      type: 'external_loan_repayment',
      amountUSD: usd,
      amountLBP: lbp,
      description: `Repaid to ${loan.lenderName}`,
      date: new Date().toISOString().split('T')[0],
    });

    setRepayAmountUSD('');
    setRepayAmountLBP('');
    setSelectedLoanId('');
    setShowRepayModal(false);

    Alert.alert('Success', 'Loan repayment recorded successfully');
  };

  const openRepayModal = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowRepayModal(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Loan Management',
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <HandCoins size={24} color="#fff" />
          <Text style={styles.summaryTitle}>Active Loans</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryCurrency}>USD</Text>
            <Text style={styles.summaryAmount}>
              ${activeLoans.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryCurrency}>LBP</Text>
            <Text style={styles.summaryAmount}>
              {activeLoans.lbp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>Borrow Money</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeLoansData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Loans ({activeLoansData.length})</Text>
            {activeLoansData.map((loan) => (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <Text style={styles.loanLender}>{loan.lenderName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.statusBadgeText}>ACTIVE</Text>
                  </View>
                </View>
                <View style={styles.loanDetails}>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Borrowed:</Text>
                    <View style={styles.loanAmounts}>
                      {loan.amountUSD > 0 && (
                        <Text style={styles.loanAmount}>${loan.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                      )}
                      {loan.amountLBP > 0 && (
                        <Text style={styles.loanAmountLBP}>{loan.amountLBP.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Remaining:</Text>
                    <View style={styles.loanAmounts}>
                      {loan.remainingUSD > 0 && (
                        <Text style={[styles.loanAmount, { color: '#DC2626', fontWeight: '700' as const }]}>
                          ${loan.remainingUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      )}
                      {loan.remainingLBP > 0 && (
                        <Text style={[styles.loanAmountLBP, { color: '#DC2626', fontWeight: '700' as const }]}>
                          {loan.remainingLBP.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.loanDate}>Borrowed on: {loan.dateBorrowed}</Text>
                </View>
                <TouchableOpacity
                  style={styles.repayButton}
                  onPress={() => openRepayModal(loan.id)}
                >
                  <Text style={styles.repayButtonText}>Repay Loan</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {repaidLoansData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repaid Loans ({repaidLoansData.length})</Text>
            {repaidLoansData.map((loan) => (
              <View key={loan.id} style={[styles.loanCard, { opacity: 0.7 }]}>
                <View style={styles.loanHeader}>
                  <Text style={styles.loanLender}>{loan.lenderName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.statusBadgeText}>REPAID</Text>
                  </View>
                </View>
                <View style={styles.loanDetails}>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Amount:</Text>
                    <View style={styles.loanAmounts}>
                      {loan.amountUSD > 0 && (
                        <Text style={styles.loanAmount}>${loan.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                      )}
                      {loan.amountLBP > 0 && (
                        <Text style={styles.loanAmountLBP}>{loan.amountLBP.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.loanDate}>Borrowed: {loan.dateBorrowed}</Text>
                  <Text style={styles.loanDate}>Repaid: {loan.dateRepaid}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {loans.length === 0 && (
          <View style={styles.emptyState}>
            <HandCoins size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No loans yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Borrow Money" to add your first loan</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Borrow Money</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Lender Name</Text>
              <TextInput
                style={styles.textInput}
                value={lenderName}
                onChangeText={setLenderName}
                placeholder="Enter lender name..."
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                  <Text style={styles.inputLabelSmall}>USD</Text>
                  <View style={styles.inputWrapper}>
                    <DollarSign size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={amountUSD}
                      onChangeText={setAmountUSD}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.amountInput}>
                  <Text style={styles.inputLabelSmall}>LBP</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.lbpIcon}>ل.ل</Text>
                    <TextInput
                      style={styles.input}
                      value={amountLBP}
                      onChangeText={setAmountLBP}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity style={styles.modalButton} onPress={handleAddLoan}>
                <Text style={styles.modalButtonText}>Add Loan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRepayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRepayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Repay Loan</Text>
              <TouchableOpacity onPress={() => setShowRepayModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedLoanId && loans.find(l => l.id === selectedLoanId) && (
                <>
                  <View style={styles.loanInfo}>
                    <Text style={styles.loanInfoLabel}>Lender: {loans.find(l => l.id === selectedLoanId)?.lenderName}</Text>
                    <Text style={styles.loanInfoLabel}>
                      Remaining: ${loans.find(l => l.id === selectedLoanId)?.remainingUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {loans.find(l => l.id === selectedLoanId)?.remainingLBP ? ` / ${loans.find(l => l.id === selectedLoanId)?.remainingLBP.toLocaleString('en-US', { minimumFractionDigits: 0 })} ل.ل` : ''}
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>Repayment Amount</Text>
                  <View style={styles.amountRow}>
                    <View style={styles.amountInput}>
                      <Text style={styles.inputLabelSmall}>USD</Text>
                      <View style={styles.inputWrapper}>
                        <DollarSign size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={repayAmountUSD}
                          onChangeText={setRepayAmountUSD}
                          placeholder="0.00"
                          keyboardType="decimal-pad"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>
                    <View style={styles.amountInput}>
                      <Text style={styles.inputLabelSmall}>LBP</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.lbpIcon}>ل.ل</Text>
                        <TextInput
                          style={styles.input}
                          value={repayAmountLBP}
                          onChangeText={setRepayAmountLBP}
                          placeholder="0"
                          keyboardType="decimal-pad"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.modalButton} onPress={handleRepayLoan}>
                    <Text style={styles.modalButtonText}>Confirm Repayment</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  summaryCard: {
    backgroundColor: '#F59E0B',
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600' as const,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryCurrency: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  summaryAmount: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700' as const,
  },
  addButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanLender: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  loanDetails: {
    marginBottom: 12,
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  loanAmounts: {
    alignItems: 'flex-end',
  },
  loanAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  loanAmountLBP: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  loanDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  repayButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  repayButtonText: {
    color: '#fff',
    fontSize: 14,
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  modalScroll: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 8,
  },
  inputLabelSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  lbpIcon: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '600' as const,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  loanInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  loanInfoLabel: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  modalButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
