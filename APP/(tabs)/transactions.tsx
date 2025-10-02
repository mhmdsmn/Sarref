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
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, DollarSign } from 'lucide-react-native';
import { useWallet } from '@/contexts/WalletContext';
import type { TransactionType } from '@/constants/types';
import { TRANSACTION_LABELS } from '@/constants/types';

const TRANSACTION_TYPES: TransactionType[] = [
  'receive_customer',
  'pay_customer',
  'commission',
  'personal_withdrawal',
  'capital_deposit',
  'promo_receipt',
  'external_loan_received',
  'external_loan_repayment',
];

export default function TransactionsScreen() {
  const { addTransaction, currentBalance } = useWallet();
  const [selectedType, setSelectedType] = useState<TransactionType>('receive_customer');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLBP, setAmountLBP] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddTransaction = () => {
    const usd = parseFloat(amountUSD) || 0;
    const lbp = parseFloat(amountLBP) || 0;

    if (usd === 0 && lbp === 0) {
      Alert.alert('Error', 'Please enter at least one amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    addTransaction({
      type: selectedType,
      amountUSD: usd,
      amountLBP: lbp,
      description: description.trim(),
      date,
    });

    setAmountUSD('');
    setAmountLBP('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);

    Alert.alert('Success', 'Transaction added successfully');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Add Transaction',
          headerStyle: { backgroundColor: '#1E40AF' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceCurrency}>USD</Text>
              <Text style={styles.balanceAmount}>
                ${currentBalance.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceCurrency}>LBP</Text>
              <Text style={styles.balanceAmount}>
                {currentBalance.lbp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Transaction Type</Text>
          <View style={styles.typeGrid}>
            {TRANSACTION_TYPES.map((type) => {
              const isSelected = selectedType === type;
              const label = TRANSACTION_LABELS[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    isSelected && { backgroundColor: label.color, borderColor: label.color },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      isSelected && styles.typeButtonTextSelected,
                    ]}
                  >
                    {label.en}
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonTextAr,
                      isSelected && styles.typeButtonTextSelected,
                    ]}
                  >
                    {label.ar}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountInput}>
              <Text style={styles.inputLabel}>USD</Text>
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
              <Text style={styles.inputLabel}>LBP</Text>
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

          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter transaction details..."
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.sectionTitle}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
            <Plus size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
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
  balanceCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  balanceLabel: {
    fontSize: 14,
    color: '#93C5FD',
    marginBottom: 12,
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
    color: '#BFDBFE',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  balanceAmount: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700' as const,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    minWidth: '48%',
    flexGrow: 1,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'center',
  },
  typeButtonTextAr: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
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
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: 8,
  },
});
