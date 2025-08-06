import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { Check, Globe, Star } from 'lucide-react';

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka', symbol: '৳' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
];

export const CurrencySettings: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(profile?.selected_currencies || (profile?.local_currency ? [profile.local_currency] : ['USD']));
  const [primaryCurrency, setPrimaryCurrency] = useState<string>(profile?.local_currency || 'USD');
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // --- Fix: Sync state with profile after refresh/profile update ---
  useEffect(() => {
    if (profile?.selected_currencies && profile.selected_currencies.length > 0) {
      setSelectedCurrencies(profile.selected_currencies);
      // Use profile.local_currency as primary if it's in the selection, otherwise first selected
      if (profile.local_currency && profile.selected_currencies.includes(profile.local_currency)) {
        setPrimaryCurrency(profile.local_currency);
      } else {
        setPrimaryCurrency(profile.selected_currencies[0]);
      }
    } else if (profile?.local_currency) {
      setSelectedCurrencies([profile.local_currency]);
      setPrimaryCurrency(profile.local_currency);
    } else {
      setSelectedCurrencies(['USD']);
      setPrimaryCurrency('USD');
    }
  }, [profile?.selected_currencies, profile?.local_currency]);

  const toggleCurrency = (currency: string) => {
    setDirty(true);
    setSelectedCurrencies(prev => {
      if (prev.includes(currency)) {
        // If removing the primary, pick another as primary
        if (primaryCurrency === currency) {
          const filtered = prev.filter(c => c !== currency);
          setPrimaryCurrency(filtered[0] || 'USD');
          return filtered;
        }
        return prev.filter(c => c !== currency);
      } else {
        // Add to selection
        return [...prev, currency];
      }
    });
  };

  const handlePrimaryChange = (currency: string) => {
    if (selectedCurrencies.includes(currency)) {
      setPrimaryCurrency(currency);
      setDirty(true);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        local_currency: primaryCurrency,
        selected_currencies: selectedCurrencies
      });
      toast.success('Currency preferences updated!');
      setDirty(false);
    } catch (error) {
      toast.error('Failed to update currency preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Currency Settings
        </h3>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          Select one or more currencies. Pick a primary currency for forms and default display.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {currencyOptions.map((currency) => {
            const selected = selectedCurrencies.includes(currency.value);
            const isPrimary = primaryCurrency === currency.value;
            return (
              <div
                key={currency.value}
                className={`relative flex flex-col items-start p-2 rounded-md border transition-all duration-200 cursor-pointer select-none min-h-0 min-w-0 text-[13px] ${
                  selected
                    ? 'border-gradient-primary bg-gradient-primary text-white'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'} h-[64px]`}
                onClick={() => toggleCurrency(currency.value)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base font-semibold">{currency.symbol}</span>
                  <div>
                    <div className="font-medium text-[13px] leading-tight">{currency.label}</div>
                    <div className="text-xs text-gray-300 dark:text-gray-400 leading-tight">{currency.value}</div>
                  </div>
                </div>
                {selected && (
                  <Check className="absolute top-1 right-1 w-4 h-4 text-white" />
                )}
                {selected && (
                  <button
                    type="button"
                    className={`absolute bottom-1 right-1 flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${isPrimary ? 'bg-white text-gray-900' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-white hover:text-gray-900'}`}
                    onClick={e => { e.stopPropagation(); handlePrimaryChange(currency.value); }}
                    disabled={isPrimary || loading}
                  >
                    <Star className="w-3 h-3 mr-0.5" />
                    {isPrimary ? 'Primary' : 'Set'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={loading || !dirty || selectedCurrencies.length === 0}
            className="px-4 py-1.5 rounded bg-gradient-primary text-white font-semibold text-sm hover:bg-gradient-primary-hover disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          How it works
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Forms and default display use your primary currency</li>
          <li>• You can filter and view data in any of your selected currencies</li>
          <li>• You can change your selection anytime</li>
        </ul>
      </div>
    </div>
  );
}; 