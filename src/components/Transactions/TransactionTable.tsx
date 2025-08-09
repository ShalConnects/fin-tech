import React, { useMemo } from 'react';
import { Edit2, Trash2, Copy, ArrowUpRight, ArrowDownRight, Calendar, Tag } from 'lucide-react';
import { Transaction, Account } from '../../types';
import { formatCurrency } from '../../utils/accountUtils';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  accounts: Account[];
  expandedRows: Set<string>;
  onToggleRow: (transactionId: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onCopyTransactionId: (transactionId: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  getAccountName: (accountId: string) => string;
}

export const TransactionTable: React.FC<TransactionTableProps> = React.memo(({
  transactions,
  accounts,
  expandedRows,
  onToggleRow,
  onEditTransaction,
  onDeleteTransaction,
  onCopyTransactionId,
  formatCurrency,
  getAccountName
}) => {
  // Memoize expensive calculations
  const transactionData = useMemo(() => {
    return transactions.map(transaction => {
      const account = accounts.find(a => a.id === transaction.account_id);
      const isTransfer = transaction.tags?.includes('transfer');
      
      return {
        transaction,
        account,
        isTransfer,
        formattedDate: format(new Date(transaction.date), 'MMM dd, yyyy'),
        formattedTime: format(new Date(transaction.date), 'HH:mm'),
        isExpanded: expandedRows.has(transaction.id)
      };
    });
  }, [transactions, accounts, expandedRows]);

  if (transactionData.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No transactions found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          No transactions match your current filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {transactionData.map((data, index) => {
            const { transaction, account, isTransfer, formattedDate, formattedTime, isExpanded } = data;
            const isEven = index % 2 === 0;
            
            return (
              <React.Fragment key={transaction.id}>
                <tr 
                  className={`
                    transition-all duration-200 ease-in-out cursor-pointer
                    ${isEven ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 
                    hover:shadow-sm
                  `} 
                  onClick={() => onToggleRow(transaction.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">{formattedDate}</div>
                      <div className="text-gray-500 dark:text-gray-400">{formattedTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium truncate max-w-xs" title={transaction.description}>
                        {transaction.description}
                      </div>
                      {transaction.tags && transaction.tags.length > 0 && (
                        <div className="flex items-center mt-1 space-x-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.tags.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getAccountName(transaction.account_id)}
                    </div>
                    {account && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {account.currency}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {isTransfer ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
                        Transfer
                      </span>
                    ) : transaction.type === 'income' ? (
                      <div className="flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Income
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                          Expense
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold">
                      <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, account?.currency || 'USD')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onCopyTransactionId(transaction.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Copy Transaction ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTransaction(transaction)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Row Content */}
                {isExpanded && (
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Transaction Details */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Transaction Details</h4>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <div><span className="font-medium">ID:</span> {transaction.id}</div>
                            <div><span className="font-medium">Created:</span> {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</div>
                            {transaction.updated_at && (
                              <div><span className="font-medium">Updated:</span> {format(new Date(transaction.updated_at), 'MMM dd, yyyy HH:mm')}</div>
                            )}
                            <div><span className="font-medium">Recurring:</span> {transaction.is_recurring ? 'Yes' : 'No'}</div>
                            {transaction.recurring_frequency && (
                              <div><span className="font-medium">Frequency:</span> {transaction.recurring_frequency}</div>
                            )}
                          </div>
                        </div>

                        {/* Financial Details */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Financial Details</h4>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <div><span className="font-medium">Amount:</span> {formatCurrency(transaction.amount, account?.currency || 'USD')}</div>
                            {transaction.saving_amount && (
                              <div><span className="font-medium">Saved:</span> {formatCurrency(transaction.saving_amount, account?.currency || 'USD')}</div>
                            )}
                            {transaction.donation_amount && (
                              <div><span className="font-medium">Donated:</span> {formatCurrency(transaction.donation_amount, account?.currency || 'USD')}</div>
                            )}
                            <div><span className="font-medium">Currency:</span> {account?.currency || 'USD'}</div>
                          </div>
                        </div>

                        {/* Tags and Notes */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Additional Info</h4>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            {transaction.tags && transaction.tags.length > 0 && (
                              <div>
                                <span className="font-medium">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {transaction.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {!transaction.tags || transaction.tags.length === 0 && (
                              <div className="text-gray-400">No tags</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

TransactionTable.displayName = 'TransactionTable'; 