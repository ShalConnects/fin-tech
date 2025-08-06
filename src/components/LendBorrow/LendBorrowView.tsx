import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Handshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { LendBorrow, LendBorrowInput, LendBorrowAnalytics } from '../../types/index';
import { LendBorrowForm } from './LendBorrowForm';
import { LendBorrowList } from './LendBorrowList';
import { PartialReturnModal } from './PartialReturnModal';
import { useFinanceStore } from '../../store/useFinanceStore';
import { LendBorrowCardSkeleton, LendBorrowTableSkeleton, LendBorrowSummaryCardsSkeleton, LendBorrowFiltersSkeleton } from './LendBorrowSkeleton';
import { toast } from 'sonner';
import { useLoadingContext } from '../../context/LoadingContext';

const currencySymbols: Record<string, string> = {
  USD: '$',
  BDT: '৳',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  ALL: 'L',
  INR: '₹',
  CAD: '$',
  AUD: '$',
};

const getCurrencySymbol = (currency: string) => currencySymbols[currency] || currency;

export const LendBorrowView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { accounts, lendBorrowRecords, fetchLendBorrowRecords, fetchAccounts, addLendBorrowRecord, loading: storeLoading } = useFinanceStore();
  const [analytics, setAnalytics] = useState<LendBorrowAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LendBorrow | null>(null);
  const [partialReturnRecord, setPartialReturnRecord] = useState<LendBorrow | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'lend' | 'borrow',
    status: 'all' as 'all' | 'active' | 'settled' | 'overdue',
    search: '',
    currency: '' as string,
    dateRange: { start: '', end: '' }
  });
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const presetDropdownRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuthStore();
  const { wrapAsync, setLoadingMessage } = useLoadingContext();

  // Date filter functions
  const getThisMonthDateRange = () => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: first.toISOString().slice(0, 10),
      end: last.toISOString().slice(0, 10)
    };
  };

  const getDateRangeLabel = () => {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      return 'Date Range';
    }
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (filters.dateRange.start === todayStr && filters.dateRange.end === todayStr) {
      return 'Today';
    }
    const day = today.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayStr = monday.toISOString().slice(0, 10);
    const sundayStr = sunday.toISOString().slice(0, 10);
    if (filters.dateRange.start === mondayStr && filters.dateRange.end === sundayStr) {
      return 'This Week';
    }
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const firstStr = first.toISOString().slice(0, 10);
    const lastStr = last.toISOString().slice(0, 10);
    if (filters.dateRange.start === firstStr && filters.dateRange.end === lastStr) {
      return 'This Month';
    }
    const firstLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const firstLastMonthStr = firstLastMonth.toISOString().slice(0, 10);
    const lastLastMonthStr = lastLastMonth.toISOString().slice(0, 10);
    if (filters.dateRange.start === firstLastMonthStr && filters.dateRange.end === lastLastMonthStr) {
      return 'Last Month';
    }
    const firstYear = new Date(today.getFullYear(), 0, 1);
    const lastYear = new Date(today.getFullYear(), 11, 31);
    const firstYearStr = firstYear.toISOString().slice(0, 10);
    const lastYearStr = lastYear.toISOString().slice(0, 10);
    if (filters.dateRange.start === firstYearStr && filters.dateRange.end === lastYearStr) {
      return 'This Year';
    }
    return 'Custom Range';
  };

  const handlePresetRange = (preset: string) => {
    const today = new Date();
    if (preset === 'custom') {
      setShowCustomModal(true);
      setShowPresetDropdown(false);
      return;
    }
    setShowCustomModal(false);
    setShowPresetDropdown(false);
    let start = '', end = '';
    switch (preset) {
      case 'today':
        start = today.toISOString().slice(0, 10);
        end = today.toISOString().slice(0, 10);
        break;
      case 'thisWeek': {
        const day = today.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        start = monday.toISOString().slice(0, 10);
        end = sunday.toISOString().slice(0, 10);
        break;
      }
      case 'thisMonth': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = first.toISOString().slice(0, 10);
        end = last.toISOString().slice(0, 10);
        break;
      }
      case 'lastMonth': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        start = first.toISOString().slice(0, 10);
        end = last.toISOString().slice(0, 10);
        break;
      }
      case 'thisYear': {
        const first = new Date(today.getFullYear(), 0, 1);
        const last = new Date(today.getFullYear(), 11, 31);
        start = first.toISOString().slice(0, 10);
        end = last.toISOString().slice(0, 10);
        break;
      }
      default:
        break;
    }
    setFilters(f => ({ ...f, dateRange: { start, end } }));
  };

  // Only show selected_currencies if available, else all
  const allCurrencyOptions = [
    'USD', 'EUR', 'GBP', 'BDT', 'JPY', 'CAD', 'AUD'
  ];
  let availableCurrencies: string[] = [];
  if (profile?.selected_currencies && profile.selected_currencies.length > 0) {
    availableCurrencies = allCurrencyOptions.filter(c => profile.selected_currencies?.includes?.(c));
  } else {
    const accountCurrencies = Array.from(new Set(accounts.map((a: any) => a.currency)));
    availableCurrencies = accountCurrencies.length > 0 ? accountCurrencies : allCurrencyOptions;
  }

  // Set default currency to user's default (first account's currency)
  useEffect(() => {
    if (availableCurrencies.length > 0 && (!selectedCurrency || !availableCurrencies.includes(selectedCurrency))) {
      setSelectedCurrency(availableCurrencies[0]);
    }
  }, [availableCurrencies, selectedCurrency]);

  // Set default currency when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedCurrency) {
      const accountCurrencies = Array.from(new Set(accounts.map((a: any) => a.currency)));
      if (accountCurrencies.length > 0) {
        setSelectedCurrency(accountCurrencies[0]);
      }
    }
  }, [accounts, selectedCurrency]);



  useEffect(() => {
    if (
      availableCurrencies.length > 0 &&
      (!filters.currency || !availableCurrencies.includes(filters.currency))
    ) {
      const defaultCurrency = getDefaultCurrency();
      setFilters(f => ({ ...f, currency: defaultCurrency }));
      setSelectedCurrency(defaultCurrency);
    }
  }, [profile, availableCurrencies, filters.currency]);

  // No default date range - show all records by default

  // Check and update overdue status for records
  const updateOverdueStatus = async (records: LendBorrow[]) => {
    if (!user) return records;
    
    const today = new Date();
    const overdueRecords = records.filter(record => 
      record.status === 'active' && 
      record.due_date && 
      new Date(record.due_date) < today
    );

    if (overdueRecords.length === 0) return records;

    // Update overdue records in batch
    const updates = overdueRecords.map(record => ({
      id: record.id,
      status: 'overdue'
    }));

    try {
      const { error } = await supabase
        .from('lend_borrow')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Error updating overdue status:', error);
        return records;
      }

      // Update local state
      return records.map(record => {
        const overdueRecord = overdueRecords.find(r => r.id === record.id);
        return overdueRecord ? { ...record, status: 'overdue' as const } : record;
      });
    } catch (error) {
      console.error('Error updating overdue status:', error);
      return records;
    }
  };

  // Calculate analytics
  const calculateAnalytics = (records: LendBorrow[]): LendBorrowAnalytics => {
    const totalLent = records
      .filter(r => r.type === 'lend')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const totalBorrowed = records
      .filter(r => r.type === 'borrow')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const outstandingLent = records
      .filter(r => r.type === 'lend' && r.status === 'active')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const outstandingBorrowed = records
      .filter(r => r.type === 'borrow' && r.status === 'active')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const overdueCount = records.filter(r => r.status === 'overdue').length;
    const activeCount = records.filter(r => r.status === 'active').length;
    const settledCount = records.filter(r => r.status === 'settled').length;
    
    // Get top person by total amount
    const personTotals = records.reduce((acc, r) => {
      acc[r.person_name] = (acc[r.person_name] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topPerson = Object.entries(personTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];
    
    // Currency breakdown
    const currencyBreakdown = records.reduce((acc, r) => {
      if (!acc[r.currency]) {
        acc[r.currency] = {
          currency: r.currency,
          total_lent: 0,
          total_borrowed: 0,
          outstanding_lent: 0,
          outstanding_borrowed: 0
        };
      }
      
      if (r.type === 'lend') {
        acc[r.currency].total_lent += r.amount;
        if (r.status === 'active') {
          acc[r.currency].outstanding_lent += r.amount;
        }
      } else {
        acc[r.currency].total_borrowed += r.amount;
        if (r.status === 'active') {
          acc[r.currency].outstanding_borrowed += r.amount;
        }
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return {
      total_lent: totalLent,
      total_borrowed: totalBorrowed,
      outstanding_lent: outstandingLent,
      outstanding_borrowed: outstandingBorrowed,
      overdue_count: overdueCount,
      active_count: activeCount,
      settled_count: settledCount,
      top_person: topPerson,
      currency_breakdown: Object.values(currencyBreakdown)
    };
  };

  // Calculate analytics for summary cards: overdue count ignores status filter
  const calculateSummaryAnalytics = (allRecords: LendBorrow[], currency: string, type: string) => {
    const currencyRecords = allRecords.filter(r => r.currency === currency);
    const typeRecords = type === 'all' ? currencyRecords : currencyRecords.filter(r => r.type === type);
    const totalLent = typeRecords.filter(r => r.type === 'lend').reduce((sum, r) => sum + r.amount, 0);
    const totalBorrowed = typeRecords.filter(r => r.type === 'borrow').reduce((sum, r) => sum + r.amount, 0);
    const outstandingLent = typeRecords.filter(r => r.type === 'lend' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);
    const outstandingBorrowed = typeRecords.filter(r => r.type === 'borrow' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);
    // Overdue count: ignore status filter, but respect currency and type
    const overdueCount = typeRecords.filter(r => r.status === 'overdue').length;
    return {
      total_lent: totalLent,
      total_borrowed: totalBorrowed,
      outstanding_lent: outstandingLent,
      outstanding_borrowed: outstandingBorrowed,
      overdue_count: overdueCount,
      currency: currency
    };
  };

  // Calculate analytics for filtered records (used for summary cards that should reflect all filters)
  const calculateFilteredAnalytics = (filteredRecords: LendBorrow[], currency: string) => {
    const totalLent = filteredRecords.filter(r => r.type === 'lend').reduce((sum, r) => sum + r.amount, 0);
    const totalBorrowed = filteredRecords.filter(r => r.type === 'borrow').reduce((sum, r) => sum + r.amount, 0);
    const outstandingLent = filteredRecords.filter(r => r.type === 'lend' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);
    const outstandingBorrowed = filteredRecords.filter(r => r.type === 'borrow' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0);
    const overdueCount = filteredRecords.filter(r => r.status === 'overdue').length;
    return {
      total_lent: totalLent,
      total_borrowed: totalBorrowed,
      outstanding_lent: outstandingLent,
      outstanding_borrowed: outstandingBorrowed,
      overdue_count: overdueCount,
      currency: currency
    };
  };

  // Filter records for the table (status filter included)
  const filteredRecords = lendBorrowRecords.filter(record => {
    if (filters.type !== 'all' && record.type !== filters.type) return false;
    if (filters.status !== 'all' && record.status !== filters.status) return false;
    if (filters.search && !record.person_name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !record.notes?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.currency && record.currency !== filters.currency) return false;
    
    // Date range filtering
    if (filters.dateRange.start && filters.dateRange.end) {
      const recordDate = record.created_at ? new Date(record.created_at) : new Date();
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      if (recordDate < startDate || recordDate > endDate) return false;
    }
    
    return true;
  });

  // Calculate overdue count directly from filtered records
  const overdueCount = filteredRecords.filter(r => r.status === 'overdue').length;
  
  const currentAnalytics = {
    total_lent: filteredRecords.filter(r => r.type === 'lend').reduce((sum, r) => sum + r.amount, 0),
    total_borrowed: filteredRecords.filter(r => r.type === 'borrow').reduce((sum, r) => sum + r.amount, 0),
    outstanding_lent: filteredRecords.filter(r => r.type === 'lend' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0),
    outstanding_borrowed: filteredRecords.filter(r => r.type === 'borrow' && r.status === 'active').reduce((sum, r) => sum + r.amount, 0),
    overdue_count: overdueCount,
    currency: filters.currency || availableCurrencies[0]
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (!currency) return amount.toString();
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return amount.toString();
    }
  };

  // Add new record
  const handleAddRecord = async (record: LendBorrowInput) => {
    if (!user) return;

    try {
      console.log('Attempting to add record:', record);

      // Add a small delay to ensure loading animation is visible
      await new Promise(resolve => setTimeout(resolve, 300));

      await addLendBorrowRecord(record);

      console.log('Successfully added record');
      setShowForm(false);
      toast.success('Record added successfully!');
    } catch (error) {
      console.error('Error adding lend/borrow record:', error);
      toast.error('Failed to add record. Please try again.');
    }
  };

  // Update record
  const handleUpdateRecord = async (id: string, updates: Partial<LendBorrowInput>): Promise<void> => {
    if (!user) return;

    // Convert empty string date fields to null
    const cleanUpdates = {
      ...updates,
      due_date: updates.due_date === "" ? null : updates.due_date,
      partial_return_date: updates.partial_return_date === "" ? null : updates.partial_return_date,
    };

    try {
      console.log('Attempting to update record:', { id, updates: cleanUpdates });

      // Add a small delay to ensure loading animation is visible
      await new Promise(resolve => setTimeout(resolve, 300));

      const { data, error } = await supabase
        .from('lend_borrow')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Error updating record: ' + error.message);
        throw error;
      }

      if (!data) {
        console.error('No data returned from update');
        toast.error('No data returned from update. Please check your database permissions.');
        return;
      }

      console.log('Successfully updated record:', data);
      // setLendBorrowRecords(prev => 
      //   prev.map(r => r.id === id ? data : r)
      // ); // This line is removed as lendBorrowRecords is now managed by useFinanceStore
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating lend/borrow record:', error);
      toast.error('Failed to update record. Please try again.');
    }
  };

  // Delete record
  const handleDeleteRecord = async (id: string) => {
    if (!user) return;

    // Wrap the delete process with loading state
    const wrappedDelete = wrapAsync(async () => {
      setLoadingMessage('Deleting record...');
      try {
        console.log('Attempting to delete record:', id);

        const { error } = await supabase
          .from('lend_borrow')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Supabase error:', error);
          toast.error('Error deleting record: ' + error.message);
          throw error;
        }

        console.log('Successfully deleted record:', id);
        // setLendBorrowRecords(prev => prev.filter(r => r.id !== id)); // This line is removed as lendBorrowRecords is now managed by useFinanceStore
        toast.success('Record deleted successfully!');
      } catch (error) {
        console.error('Error deleting lend/borrow record:', error);
        toast.error('Failed to delete record. Please try again.');
      }
    });
    
    // Execute the wrapped delete function
    await wrappedDelete();
  };

  // Update status
  const handleUpdateStatus = async (id: string, status: LendBorrow['status']) => {
    try {
      await useFinanceStore.getState().updateLendBorrowRecord(id, { status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handlePartialReturn = (record: LendBorrow) => {
    console.log('Partial return clicked:', record);
    setPartialReturnRecord(record);
  };

  const handlePartialReturnUpdated = (updatedRecord: LendBorrow) => {
    // setLendBorrowRecords(prev => 
    //   prev.map(record => record.id === updatedRecord.id ? updatedRecord : record)
    // ); // This line is removed as lendBorrowRecords is now managed by useFinanceStore
    setPartialReturnRecord(null);
  };

  // Update analytics when records change
  useEffect(() => {
    setAnalytics(calculateAnalytics(lendBorrowRecords));
    setLoading(false);
  }, [lendBorrowRecords]);

  // Update loading state based on store loading and data availability
  useEffect(() => {
    if (storeLoading || !user) {
      setLoading(true);
    } else if (user && accounts.length > 0 && availableCurrencies.length > 0) {
      setLoading(false);
    }
  }, [storeLoading, user, accounts, availableCurrencies]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchLendBorrowRecords();
    }
  }, [user, fetchAccounts, fetchLendBorrowRecords]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false);
      }
    }
    if (showCurrencyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCurrencyMenu]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setShowPresetDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to capitalize first letter
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper function to get default currency
  const getDefaultCurrency = () => {
    if (profile?.local_currency && availableCurrencies.includes(profile.local_currency)) {
      return profile.local_currency;
    }
    return availableCurrencies[0] || 'USD';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Smooth skeleton for lend & borrow page */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters skeleton */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <LendBorrowFiltersSkeleton />
          </div>
          
          {/* Summary cards skeleton */}
          <div className="p-4">
            <LendBorrowSummaryCardsSkeleton />
          </div>
          
          {/* Table skeleton */}
          <div className="p-4">
            <LendBorrowTableSkeleton rows={6} />
          </div>
        </div>
        
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <LendBorrowCardSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (availableCurrencies.length === 0) {
    return <div className="min-h-[300px] flex items-center justify-center text-xl">No accounts or currencies found. Please add an account first.</div>;
  }

  if (!selectedCurrency) {
    return <div className="min-h-[300px] flex items-center justify-center text-xl">No currency selected or available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Unified Table View - New Section */}
      <div className="space-y-6">

        {/* Unified Filters and Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start" style={{ marginBottom: 0 }}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
                <div>
                  <div className="relative">
                    <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${filters.search ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className={`w-full pl-8 pr-2 py-1.5 text-[13px] h-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors ${
                        filters.search 
                          ? 'border-blue-300 dark:border-blue-600' 
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                      style={filters.search ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                      placeholder="Search lend & borrow…"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCurrencyMenu(v => !v);
                        setShowTypeMenu(false);
                        setShowStatusMenu(false);
                      }}
                      className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                        filters.currency 
                          ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      style={filters.currency ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                    >
                      <span>{capitalize(filters.currency || getDefaultCurrency())}</span>
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showCurrencyMenu && (
                      <div className="absolute left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {availableCurrencies.map(currency => (
                          <button
                            key={currency}
                            onClick={() => { setFilters({ ...filters, currency }); setShowCurrencyMenu(false); }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.currency === currency ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                          >
                            {currency}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative" ref={typeMenuRef}>
                    <button
                      onClick={() => {
                        setShowTypeMenu(v => !v);
                        setShowCurrencyMenu(false);
                        setShowStatusMenu(false);
                      }}
                      className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                        filters.type !== 'all' 
                          ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      style={filters.type !== 'all' ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                    >
                      <span>{filters.type === 'all' ? 'All Types' : capitalize(filters.type)}</span>
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showTypeMenu && (
                      <div className="absolute left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => { setFilters({ ...filters, type: 'all' }); setShowTypeMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.type === 'all' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          All Types
                        </button>
                        <button
                          onClick={() => { setFilters({ ...filters, type: 'lend' }); setShowTypeMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.type === 'lend' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          {t('lendBorrow.lend')}
                        </button>
                        <button
                          onClick={() => { setFilters({ ...filters, type: 'borrow' }); setShowTypeMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.type === 'borrow' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          {t('lendBorrow.borrow')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative" ref={statusMenuRef}>
                    <button
                      onClick={() => {
                        setShowStatusMenu(v => !v);
                        setShowCurrencyMenu(false);
                        setShowTypeMenu(false);
                      }}
                      className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                      filters.status !== 'all' 
                        ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    style={filters.status !== 'all' ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                    >
                      <span>{filters.status === 'all' ? 'All Status' : capitalize(filters.status)}</span>
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showStatusMenu && (
                      <div className="absolute left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => { setFilters({ ...filters, status: 'all' }); setShowStatusMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.status === 'all' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => { setFilters({ ...filters, status: 'active' }); setShowStatusMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.status === 'active' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          {t('lendBorrow.active')}
                        </button>
                        <button
                          onClick={() => { setFilters({ ...filters, status: 'settled' }); setShowStatusMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.status === 'settled' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          {t('lendBorrow.settled')}
                        </button>
                        <button
                          onClick={() => { setFilters({ ...filters, status: 'overdue' }); setShowStatusMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${filters.status === 'overdue' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}`}
                        >
                          {t('lendBorrow.overdue')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <div className="relative" ref={presetDropdownRef}>
                    <button
                      className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                        filters.dateRange.start && filters.dateRange.end 
                          ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      } ${showPresetDropdown ? 'ring-2 ring-blue-500' : ''}`}
                      style={filters.dateRange.start && filters.dateRange.end ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                      onClick={() => setShowPresetDropdown(v => !v)}
                      type="button"
                    >
                      <span>{getDateRangeLabel()}</span>
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showPresetDropdown && (
                      <div className="absolute left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
                        <button
                          onClick={() => handlePresetRange('today')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => handlePresetRange('thisWeek')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => handlePresetRange('thisMonth')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => handlePresetRange('lastMonth')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          Last Month
                        </button>
                        <button
                          onClick={() => handlePresetRange('thisYear')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          This Year
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handlePresetRange('custom')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            Custom Range
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                {(filters.search || filters.type !== 'all' || filters.status !== 'all' || (filters.currency && filters.currency !== getDefaultCurrency()) || (filters.dateRange.start && filters.dateRange.end)) && (
                  <button
                    onClick={() => setFilters({ search: '', type: 'all', status: 'all', currency: '', dateRange: { start: '', end: '' } })}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                    title="Clear all filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <div className="ml-auto">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-primary text-white rounded-md hover:bg-gradient-primary-hover transition-colors whitespace-nowrap h-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lend/Borrow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards Grid (above table header) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
              <div className="flex items-center justify-between">
                <div className="text-left">
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Lent</p>
                  <p className="font-bold text-green-600 dark:text-green-400" style={{ fontSize: '1.2rem' }}>
                    {formatCurrency(currentAnalytics.total_lent, currentAnalytics.currency)}
                  </p>
                </div>
                <span className="text-green-600" style={{ fontSize: '1.2rem' }}>{getCurrencySymbol(currentAnalytics.currency)}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
              <div className="flex items-center justify-between">
                <div className="text-left">
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Borrowed</p>
                  <p className="font-bold text-red-600 dark:text-red-400" style={{ fontSize: '1.2rem' }}>
                    {formatCurrency(currentAnalytics.total_borrowed, currentAnalytics.currency)}
                  </p>
                </div>
                <span className="text-red-600" style={{ fontSize: '1.2rem' }}>{getCurrencySymbol(currentAnalytics.currency)}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400" style={{ fontSize: '1.2rem' }}>
                    {formatCurrency(currentAnalytics.outstanding_lent - currentAnalytics.outstanding_borrowed, currentAnalytics.currency)}
                  </p>
                </div>
                <Clock className="text-blue-600" style={{ fontSize: '1.2rem', width: '1.2rem', height: '1.2rem' }} />
              </div>
            </div>
          </div>
          {/* Table Section */}
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <LendBorrowList
                records={filteredRecords}
                loading={loading}
                onEdit={record => setEditingRecord(record)}
                onDelete={handleDeleteRecord}
                onUpdateStatus={handleUpdateStatus}
                onPartialReturn={handlePartialReturn}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LendBorrowForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddRecord}
        />
      )}

      {/* Edit Form Modal */}
      {editingRecord && (
        <LendBorrowForm
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSubmit={async (updates) => {
            try {
              await handleUpdateRecord(editingRecord.id, updates);
            } catch (error) {
              console.error('Error in edit form submission:', error);
            }
          }}
        />
      )}

      {/* Partial Return Modal */}
      {partialReturnRecord && (
        console.log('Rendering PartialReturnModal for:', partialReturnRecord),
        <PartialReturnModal
          isOpen={!!partialReturnRecord}
          record={partialReturnRecord}
          onClose={() => setPartialReturnRecord(null)}
          onUpdated={handlePartialReturnUpdated}
        />
      )}
    </div>
  );
}; 