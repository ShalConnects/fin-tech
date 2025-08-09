import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PlusIcon } from '@heroicons/react/24/outline';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { SavingsGoalForm } from './SavingsGoalForm';
import { Dialog } from '@headlessui/react';

export const SavingsView: React.FC = () => {
  const { accounts, savingsGoals, fetchSavingsGoals, saveSavingsGoal, loading, error } = useFinanceStore();
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [saveAmount, setSaveAmount] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !saveAmount) return;

    await saveSavingsGoal(selectedGoal.id, parseFloat(saveAmount));
    setShowSaveForm(false);
    setSaveAmount('');
    setSelectedGoal(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <button
          onClick={() => setShowNewGoalForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Savings Goal
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const sourceAccount = accounts.find(a => a.id === goal.source_account_id);
          const savingsAccount = accounts.find(a => a.id === goal.savings_account_id);
          const progress = (goal.current_amount / goal.target_amount) * 100;
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
              {goal.description && (
                <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
              )}
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">
                    {formatCurrency(goal.current_amount, sourceAccount?.currency || 'USD')}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(goal.target_amount, sourceAccount?.currency || 'USD')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  From: {sourceAccount?.name || 'Unknown Account'}
                </p>
                <p className="text-sm text-gray-500">
                  To: {savingsAccount?.name || 'Unknown Account'}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedGoal(goal);
                  setShowSaveForm(true);
                }}
                disabled={loading}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Save Now'}
              </button>
            </div>
          );
        })}
      </div>

      <SavingsGoalForm
        isOpen={showNewGoalForm}
        onClose={() => setShowNewGoalForm(false)}
      />

      {/* Save Amount Dialog */}
      <Dialog open={showSaveForm} onClose={() => setShowSaveForm(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Save to {selectedGoal?.name}
            </Dialog.Title>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {selectedGoal && accounts.find(a => a.id === selectedGoal.source_account_id)?.currency === 'USD' ? '$' : ''}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={saveAmount}
                    onChange={(e) => setSaveAmount(e.target.value)}
                    className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {selectedGoal && accounts.find(a => a.id === selectedGoal.source_account_id)?.currency !== 'USD' 
                        ? accounts.find(a => a.id === selectedGoal.source_account_id)?.currency 
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveForm(false);
                    setSaveAmount('');
                    setSelectedGoal(null);
                  }}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}; 