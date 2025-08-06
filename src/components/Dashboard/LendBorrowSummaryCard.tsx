import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Handshake, AlertTriangle, ArrowRight, Calendar, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { LendBorrow } from '../../types/index';
import { StatCard } from './StatCard';
import { CustomDropdown } from '../Purchases/CustomDropdown';
import { formatCurrency } from '../../utils/currency';

export const LendBorrowSummaryCard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [records, setRecords] = useState<LendBorrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLentTooltip, setShowLentTooltip] = useState(false);
  const [showBorrowedTooltip, setShowBorrowedTooltip] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState('');

  // Get all unique currencies from records
  const recordCurrencies = useMemo(() => {
    return Array.from(new Set(records.map(r => r.currency)));
  }, [records]);

  // Filter currencies based on profile.selected_currencies
  const filteredCurrencies = useMemo(() => {
    if (profile?.selected_currencies && profile.selected_currencies.length > 0) {
      // Only show currencies that are both in selected_currencies and present in records
      return recordCurrencies.filter(c => profile.selected_currencies?.includes?.(c));
    }
    return recordCurrencies;
  }, [profile?.selected_currencies, recordCurrencies]);

  // Set default currency filter
  useEffect(() => {
    if (!filterCurrency && filteredCurrencies.length > 0) {
      setFilterCurrency(filteredCurrencies[0]);
    }
  }, [filteredCurrencies, filterCurrency]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('lend_borrow')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setRecords(data || []);
        setLoading(false);
      });
  }, [user]);

  // Filter records by currency
  const filteredRecords = records.filter(r => r.currency === filterCurrency);

  const totalLent = filteredRecords.filter(r => r.type === 'lend').reduce((sum, r) => sum + r.amount, 0);
  const totalBorrowed = filteredRecords.filter(r => r.type === 'borrow').reduce((sum, r) => sum + r.amount, 0);
  const outstandingLoans = filteredRecords.filter(r => r.type === 'lend' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);
  const outstandingDebts = filteredRecords.filter(r => r.type === 'borrow' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);

  // Group by person for tooltips (only active records)
  const lentByPerson = filteredRecords
    .filter(r => r.type === 'lend' && r.status === 'active')
    .reduce((acc, record) => {
      const person = record.person_name || 'Unknown';
      acc[person] = (acc[person] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

  const borrowedByPerson = filteredRecords
    .filter(r => r.type === 'borrow' && r.status === 'active')
    .reduce((acc, record) => {
      const person = record.person_name || 'Unknown';
      acc[person] = (acc[person] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalActiveLent = Object.values(lentByPerson).reduce((sum, amt) => sum + amt, 0);
  const totalActiveBorrowed = Object.values(borrowedByPerson).reduce((sum, amt) => sum + amt, 0);

  // Don't render the card if there are no records
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lend & Borrow Overview</h2>
        {/* Currency Filter using CustomDropdown */}
        <CustomDropdown
          options={filteredCurrencies.map(currency => ({ value: currency, label: currency }))}
          value={filterCurrency}
          onChange={setFilterCurrency}
          fullWidth={false}
          className="bg-transparent border-0 shadow-none text-gray-500 text-xs h-7 min-h-0 hover:bg-gray-100 focus:ring-0 focus:outline-none"
          style={{ padding: '10px', paddingRight: '5px' }}
          dropdownMenuClassName="!bg-[#d3d3d3bf] !top-[20px]"
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-6">
            <div className="w-full relative">
              <StatCard
                title={<div className="flex items-center">Total Lend
                  <div className="relative">
                    <button
                      type="button"
                      className="ml-1 p-1 rounded-full hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onMouseEnter={() => setShowLentTooltip(true)}
                      onMouseLeave={() => setShowLentTooltip(false)}
                      onFocus={() => setShowLentTooltip(true)}
                      onBlur={() => setShowLentTooltip(false)}
                      onClick={() => setShowLentTooltip(v => !v)}
                      tabIndex={0}
                      aria-label="Show lent info"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </button>
                    {showLentTooltip && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 animate-fadein capitalize">
                        <div className="font-semibold mb-2 text-xs">Total: <span className="font-bold">{formatCurrency(totalActiveLent, filterCurrency)}</span></div>
                        <div className="font-medium mb-1 text-xs">People Lent To ({Object.keys(lentByPerson).length}):</div>
                        <ul className="space-y-1">
                          {Object.entries(lentByPerson).map(([person, amount]) => (
                            <li key={person} className="flex justify-between">
                              <span className="truncate max-w-[120px]" title={person}>{person}</span>
                              <span className="ml-2 tabular-nums">{formatCurrency(amount, filterCurrency)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>}
                value={formatCurrency(totalActiveLent, filterCurrency)}
                color="green"
              />
            </div>
            <div className="w-full relative">
              <StatCard
                title={<div className="flex items-center">Total Borrowed
                  <div className="relative">
                    <button
                      type="button"
                      className="ml-1 p-1 rounded-full hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onMouseEnter={() => setShowBorrowedTooltip(true)}
                      onMouseLeave={() => setShowBorrowedTooltip(false)}
                      onFocus={() => setShowBorrowedTooltip(true)}
                      onBlur={() => setShowBorrowedTooltip(false)}
                      onClick={() => setShowBorrowedTooltip(v => !v)}
                      tabIndex={0}
                      aria-label="Show borrowed info"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </button>
                    {showBorrowedTooltip && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 animate-fadein capitalize">
                        <div className="font-semibold mb-2 text-xs">Total: <span className="font-bold">{formatCurrency(totalActiveBorrowed, filterCurrency)}</span></div>
                        <div className="font-medium mb-1 text-xs">People Borrowed From ({Object.keys(borrowedByPerson).length}):</div>
                        <ul className="space-y-1">
                          {Object.entries(borrowedByPerson).map(([person, amount]) => (
                            <li key={person} className="flex justify-between">
                              <span className="truncate max-w-[120px]" title={person}>{person}</span>
                              <span className="ml-2 tabular-nums">{formatCurrency(amount, filterCurrency)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>}
                value={formatCurrency(totalActiveBorrowed, filterCurrency)}
                color="red"
              />
            </div>
          </div>
          {/* Removed Upcoming Due Notification block as it's now handled by the Urgent sidebar */}
        </>
      )}
    </div>
  );
}; 