import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { toast } from 'sonner';
import { 
  Heart, 
  Clock, 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  User,
  FileText,
  Download,
  Bell,
  Settings,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LastWishProps {
  setActiveTab?: (tab: string) => void;
  forceFreeAccess?: boolean;
}

interface LastWishSettings {
  isEnabled: boolean;
  checkInFrequency: number; // days
  lastCheckIn: string | null;
  recipients: Array<{
    id: string;
    email: string;
    name: string;
    relationship: string;
  }>;
  includeData: {
    accounts: boolean;
    transactions: boolean;
    purchases: boolean;
    lendBorrow: boolean;
    savings: boolean;
    analytics: boolean;
  };
  message: string;
  isActive: boolean;
}

export const LastWish: React.FC<LastWishProps> = ({ setActiveTab, forceFreeAccess }) => {
  const { user, profile } = useAuthStore();
  const { accounts, transactions, purchases, donationSavingRecords } = useFinanceStore();
  const [lendBorrowRecords, setLendBorrowRecords] = useState<any[]>([]);
  
  // Enable for all users (removed premium restriction)
  const isPremium = true;
  const [settings, setSettings] = useState<LastWishSettings>({
    isEnabled: false,
    checkInFrequency: 30,
    lastCheckIn: null,
    recipients: [],
    includeData: {
      accounts: true,
      transactions: true,
      purchases: true,
      lendBorrow: true,
      savings: true,
      analytics: true,
    },
    message: '',
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<any>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState<number | null>(null);
  const messageEditorRef = useRef<HTMLDivElement>(null);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  // Load settings from database
  useEffect(() => {
    loadLastWishSettings();
  }, [user]);

  // Debug: Check current database state
  useEffect(() => {
    if (user) {
      const debugDatabase = async () => {
        const { data, error } = await supabase
          .from('last_wish_settings')
          .select('*')
          .eq('user_id', user.id);
        
        console.log('LastWish - Current database state:', data, 'Error:', error);
      };
      debugDatabase();
    }
  }, [user]);

  // Fetch lend/borrow records
  useEffect(() => {
    if (!user) return;
    
    const fetchLendBorrowRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('lend_borrow')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setLendBorrowRecords(data || []);
      } catch (error) {
        console.error('Error fetching lend/borrow records:', error);
        setLendBorrowRecords([]);
      }
    };

    fetchLendBorrowRecords();
  }, [user]);

  // Calculate days until next check-in
  useEffect(() => {
    if (settings.lastCheckIn && settings.isEnabled) {
      const lastCheckIn = new Date(settings.lastCheckIn);
      const nextCheckIn = new Date(lastCheckIn.getTime() + (settings.checkInFrequency * 24 * 60 * 60 * 1000));
      const now = new Date();
      const diffTime = nextCheckIn.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilCheckIn(diffDays);
    }
  }, [settings.lastCheckIn, settings.checkInFrequency, settings.isEnabled]);

  const loadLastWishSettings = async () => {
    if (!user) return;

    try {
      console.log('LastWish - Loading settings for user:', user.id);
      
      // First, get all records for this user to check for duplicates
      const { data: allRecords, error: fetchError } = await supabase
        .from('last_wish_settings')
        .select('*')
        .eq('user_id', user.id);

      console.log('LastWish - All records for user:', allRecords);

      if (fetchError) {
        console.error('Error fetching all records:', fetchError);
        return;
      }

      let data: any = null;

      // If there are multiple records, delete all but the most recent one
      if (allRecords && allRecords.length > 1) {
        console.log('LastWish - Found duplicate records, cleaning up...');
        
        // Sort by updated_at and keep the most recent
        const sortedRecords = allRecords.sort((a, b) => 
          new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        );
        
        const recordToKeep = sortedRecords[0];
        const recordsToDelete = sortedRecords.slice(1);
        
        console.log('LastWish - Keeping record:', recordToKeep.id);
        console.log('LastWish - Deleting records:', recordsToDelete.map(r => r.id));
        
        // Delete duplicate records
        for (const record of recordsToDelete) {
          const { error: deleteError } = await supabase
            .from('last_wish_settings')
            .delete()
            .eq('id', record.id);
          
          if (deleteError) {
            console.error('Error deleting duplicate record:', deleteError);
          }
        }
        
        // Use the record we kept
        data = recordToKeep;
        console.log('LastWish - Using cleaned record:', data);
      } else if (allRecords && allRecords.length === 1) {
        // Only one record, use it
        data = allRecords[0];
        console.log('LastWish - Using single record:', data);
      } else {
        // No records found, create default settings
        console.log('LastWish - No records found, creating default settings');
        const defaultSettings = {
          user_id: user.id,
          is_enabled: false,
          check_in_frequency: 30,
          recipients: [],
          include_data: {
            accounts: true,
            transactions: true,
            purchases: true,
            lendBorrow: true,
            savings: true,
            analytics: true,
          },
          message: '',
          is_active: false,
        };

        const { error: createError } = await supabase
          .from('last_wish_settings')
          .upsert(defaultSettings);

        if (createError) {
          console.error('Error creating default settings:', createError);
          return;
        }
        
        // Set default settings in state
        setSettings({
          isEnabled: false,
          checkInFrequency: 30,
          lastCheckIn: null,
          recipients: [],
          includeData: {
            accounts: true,
            transactions: true,
            purchases: true,
            lendBorrow: true,
            savings: true,
            analytics: true,
          },
          message: '',
          isActive: false,
        });
        return;
      }

      // Process the data we found
      if (data) {
        console.log('LastWish - Loading settings from database:', data);
        console.log('LastWish - is_enabled:', data.is_enabled, 'is_active:', data.is_active);
        setSettings({
          isEnabled: Boolean(data.is_enabled),
          checkInFrequency: data.check_in_frequency || 30,
          lastCheckIn: data.last_check_in,
          recipients: data.recipients || [],
          includeData: data.include_data || {
            accounts: true,
            transactions: true,
            purchases: true,
            lendBorrow: true,
            savings: true,
            analytics: true,
          },
          message: data.message || '',
          isActive: Boolean(data.is_active),
        });
      }
    } catch (error) {
      console.error('Error in loadLastWishSettings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert({
          user_id: user.id,
          is_enabled: settings.isEnabled,
          check_in_frequency: settings.checkInFrequency,
          last_check_in: settings.lastCheckIn,
          recipients: settings.recipients,
          include_data: settings.includeData,
          message: settings.message,
          is_active: settings.isActive,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Last Wish settings saved successfully');
    } catch (error) {
      console.error('Error saving last wish settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('last_wish_settings')
        .update({
          last_check_in: now,
          updated_at: now,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, lastCheckIn: now }));
      toast.success('Check-in successful! Your data is safe.');
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to check-in');
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = async (recipient: any) => {
    if (!user) return;

    // Check if already at maximum recipients
    if (settings.recipients.length >= 3) {
      toast.error('Maximum 3 recipients allowed');
      return;
    }

    // Check for duplicate email
    const emailExists = settings.recipients.some(
      existingRecipient => existingRecipient.email.toLowerCase() === recipient.email.toLowerCase()
    );

    if (emailExists) {
      toast.error('A recipient with this email already exists');
      return;
    }

    const newRecipient = {
      id: Date.now().toString(),
      email: recipient.email,
      name: recipient.name,
      relationship: recipient.relationship,
    };

    const updatedRecipients = [...settings.recipients, newRecipient];
    
    // If this is the first recipient and Last Wish is not enabled, enable it
    const shouldEnable = updatedRecipients.length === 1 && !settings.isEnabled;
    
    setSettings(prev => ({
      ...prev,
      recipients: updatedRecipients,
      isEnabled: shouldEnable ? true : prev.isEnabled,
      isActive: shouldEnable ? true : prev.isActive,
    }));

    // Save to database
    try {
      const saveData = {
        user_id: user.id,
        is_enabled: shouldEnable ? true : Boolean(settings.isEnabled),
        check_in_frequency: settings.checkInFrequency,
        last_check_in: settings.lastCheckIn,
        recipients: updatedRecipients,
        include_data: settings.includeData,
        message: settings.message,
        is_active: shouldEnable ? true : Boolean(settings.isActive),
        updated_at: new Date().toISOString(),
      };
      
      console.log('LastWish - Saving recipient data:', saveData);
      
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert(saveData);

      if (error) throw error;

      if (shouldEnable) {
        toast.success('Recipient added and Last Wish enabled successfully!');
      } else {
        toast.success('Recipient added successfully');
      }
    } catch (error) {
      console.error('Error adding recipient:', error);
      toast.error('Failed to add recipient');
      // Revert the state if save failed
      setSettings(prev => ({
        ...prev,
        recipients: prev.recipients.filter(r => r.id !== newRecipient.id),
        isEnabled: settings.isEnabled,
        isActive: settings.isActive,
      }));
    }
  };

  const removeRecipient = async (id: string) => {
    if (!user) return;

    const updatedRecipients = settings.recipients.filter(r => r.id !== id);
    
    // If removing the last recipient and Last Wish is enabled, disable it
    const shouldDisable = updatedRecipients.length === 0 && settings.isEnabled;
    
    setSettings(prev => ({
      ...prev,
      recipients: updatedRecipients,
      isEnabled: shouldDisable ? false : prev.isEnabled,
      isActive: shouldDisable ? false : prev.isActive,
    }));

    // Save to database
    try {
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert({
          user_id: user.id,
          is_enabled: shouldDisable ? false : settings.isEnabled,
          check_in_frequency: settings.checkInFrequency,
          last_check_in: settings.lastCheckIn,
          recipients: updatedRecipients,
          include_data: settings.includeData,
          message: settings.message,
          is_active: shouldDisable ? false : settings.isActive,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (shouldDisable) {
        toast.success('Recipient removed. Last Wish disabled because no recipients remain.');
      } else {
        toast.success('Recipient removed successfully');
      }
    } catch (error) {
      console.error('Error removing recipient:', error);
      toast.error('Failed to remove recipient');
      // Revert the state if save failed
      setSettings(prev => ({
        ...prev,
        recipients: settings.recipients,
        isEnabled: settings.isEnabled,
        isActive: settings.isActive,
      }));
    }
  };

  const toggleDataInclusion = (key: keyof typeof settings.includeData) => {
    setSettings(prev => ({
      ...prev,
      includeData: {
        ...prev.includeData,
        [key]: !prev.includeData[key],
      },
    }));
  };

  const toggleLastWishEnabled = async (enabled: boolean) => {
    if (!user) return;

    // If trying to enable but no recipients, show error and open recipient modal
    if (enabled && settings.recipients.length === 0) {
      toast.error('Please add at least one recipient before enabling Last Wish');
      setShowRecipientModal(true);
      return;
    }

    setSettings(prev => ({ 
      ...prev, 
      isEnabled: enabled,
      isActive: enabled 
    }));
    
    try {
      const saveData = {
        user_id: user.id,
        is_enabled: Boolean(enabled),
        check_in_frequency: settings.checkInFrequency,
        last_check_in: settings.lastCheckIn,
        recipients: settings.recipients,
        include_data: settings.includeData,
        message: settings.message,
        is_active: Boolean(enabled),
        updated_at: new Date().toISOString(),
      };
      
      console.log('LastWish - Saving toggle data:', saveData);
      
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert(saveData);

      if (error) throw error;

      toast.success(enabled ? 'Last Wish enabled successfully' : 'Last Wish disabled successfully');
    } catch (error) {
      console.error('Error toggling last wish:', error);
      toast.error('Failed to update Last Wish status');
      // Revert the state if save failed
      setSettings(prev => ({ 
        ...prev, 
        isEnabled: !enabled,
        isActive: !enabled 
      }));
    }
  };

  const updateCheckInFrequency = async (frequency: number) => {
    if (!user) return;

    setSettings(prev => ({ ...prev, checkInFrequency: frequency }));
    
    try {
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert({
          user_id: user.id,
          is_enabled: settings.isEnabled,
          check_in_frequency: frequency,
          last_check_in: settings.lastCheckIn,
          recipients: settings.recipients,
          include_data: settings.includeData,
          message: settings.message,
          is_active: settings.isActive,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Check-in frequency updated successfully');
    } catch (error) {
      console.error('Error updating check-in frequency:', error);
      toast.error('Failed to update check-in frequency');
      // Revert the state if save failed
      setSettings(prev => ({ ...prev, checkInFrequency: settings.checkInFrequency }));
    }
  };

  // Text Editor Functions
  const formatText = (command: string) => {
    if (messageEditorRef.current) {
      document.execCommand(command, false);
      messageEditorRef.current.focus();
    }
  };

  const insertText = (text: string) => {
    if (messageEditorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Handle line breaks properly
        if (text.includes('\n')) {
          const lines = text.split('\n');
          lines.forEach((line, index) => {
            if (index > 0) {
              // Insert line break
              const br = document.createElement('br');
              range.insertNode(br);
              range.setStartAfter(br);
            }
            if (line) {
              // Insert text
              const textNode = document.createTextNode(line);
              range.insertNode(textNode);
              range.setStartAfter(textNode);
            }
          });
        } else {
          // Insert regular text
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
        }
        
        // Update selection
        selection.removeAllRanges();
        selection.addRange(range);
        messageEditorRef.current.focus();
      }
    }
  };

  const clearMessage = () => {
    if (messageEditorRef.current) {
      messageEditorRef.current.innerHTML = '';
      setSettings(prev => ({ ...prev, message: '' }));
    }
  };

  const handleMessageInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    // Only update if content actually changed to prevent unnecessary re-renders
    if (content !== settings.message) {
      setSettings(prev => ({ ...prev, message: content }));
    }
  };

  // Initialize editor content only once
  useEffect(() => {
    if (messageEditorRef.current && settings.message && !isEditorInitialized) {
      messageEditorRef.current.innerHTML = settings.message;
      setIsEditorInitialized(true);
    }
  }, [settings.message, isEditorInitialized]);

  const handleMessageBlur = () => {
    if (messageEditorRef.current) {
      const content = messageEditorRef.current.innerHTML;
      setSettings(prev => ({ ...prev, message: content }));
    }
  };

  const handleMessageFocus = () => {
    if (messageEditorRef.current) {
      // Ensure cursor is at the end when focusing
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(messageEditorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Add placeholder effect
  useEffect(() => {
    if (messageEditorRef.current) {
      const element = messageEditorRef.current;
      const placeholder = element.getAttribute('data-placeholder');
      
      const handleFocus = () => {
        if (element.textContent === placeholder) {
          element.textContent = '';
        }
      };
      
      const handleBlur = () => {
        if (element.textContent === '') {
          element.textContent = placeholder;
        }
      };
      
      // Set initial placeholder if empty
      if (!element.textContent && placeholder) {
        element.textContent = placeholder;
      }
      
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
      
      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Insert a line break at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);
        
        // Move cursor after the line break
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const saveMessage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('last_wish_settings')
        .upsert({
          user_id: user.id,
          is_enabled: settings.isEnabled,
          check_in_frequency: settings.checkInFrequency,
          last_check_in: settings.lastCheckIn,
          recipients: settings.recipients,
          include_data: settings.includeData,
          message: settings.message,
          is_active: settings.isActive,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Message saved successfully');
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    } finally {
      setLoading(false);
    }
  };

  const getDataSummary = () => {
    return {
      accounts: accounts.length,
      transactions: transactions.length,
      purchases: purchases.length,
      lendBorrow: lendBorrowRecords.length,
      savings: donationSavingRecords.filter(r => r.type === 'saving').length,
      totalValue: accounts.reduce((sum, acc) => sum + (acc.calculated_balance || 0), 0),
    };
  };

  const dataSummary = getDataSummary();

  // Show upgrade prompt for free users
  if (!isPremium) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Heart className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Last Wish - Digital Time Capsule
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ensure your financial legacy is preserved and shared with loved ones
            </p>
          </div>
        </div>

        {/* Premium Upgrade Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Premium Feature
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upgrade to Premium to access Last Wish
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                What's included in Last Wish:
              </h5>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Automated data delivery to loved ones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Configurable check-in reminders</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Multiple recipient support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Personal message attachment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Secure encrypted delivery</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/settings'}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => setActiveTab ? setActiveTab('plans') : window.location.href = '/settings'}
                className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Heart className="w-6 h-6 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Last Wish - Digital Time Capsule
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ensure your financial legacy is preserved and shared with loved ones
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${settings.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium text-gray-900 dark:text-white">
              {settings.isEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          {settings.isEnabled && daysUntilCheckIn !== null && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {daysUntilCheckIn > 0 ? `${daysUntilCheckIn} days until check-in` : 'Overdue for check-in'}
              </span>
            </div>
          )}
        </div>
        
        {settings.isEnabled && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Check In Now</span>
            </button>
            <button
              onClick={() => toggleLastWishEnabled(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Disable</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable/Disable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Enable Last Wish</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => toggleLastWishEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            When enabled, your financial data will be automatically sent to designated recipients if you don't check in regularly.
          </p>
        </div>

        {/* Check-in Frequency */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Check-in Frequency</h4>
          <div className="space-y-3">
            {[7, 14, 30, 60, 90].map((days) => (
              <label key={days} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={days}
                  checked={settings.checkInFrequency === days}
                  onChange={(e) => updateCheckInFrequency(parseInt(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Every {days} day{days !== 1 ? 's' : ''}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Recipients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Recipients</h4>
          <button
            onClick={() => setShowRecipientModal(true)}
            disabled={settings.recipients.length >= 3}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipient ({settings.recipients.length}/3)</span>
          </button>
        </div>
        
        {settings.recipients.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No recipients added yet.</p>
        ) : (
          <div className="space-y-3">
            {settings.recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{recipient.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{recipient.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{recipient.relationship}</div>
                </div>
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Data to Include</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.includeData).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleDataInclusion(key as keyof typeof settings.includeData)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                ({dataSummary[key as keyof typeof dataSummary] || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Personal Message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Personal Message</h4>
          <button
            onClick={() => setShowMessage(!showMessage)}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            {showMessage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showMessage ? 'Hide' : 'Show'}</span>
          </button>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Text Editor Toolbar */}
          <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Underline"
            >
              <u>U</u>
            </button>
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button
              type="button"
              onClick={() => insertText('\n• ')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertText('\n1. ')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Numbered List"
            >
              1. List
            </button>
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button
              type="button"
              onClick={() => insertText('\n\n')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="New Line"
            >
              ↵
            </button>
            <button
              type="button"
              onClick={clearMessage}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Clear Message"
            >
              Clear
            </button>
          </div>
          {/* Text Editor */}
          <div
            ref={messageEditorRef}
            contentEditable
            className="w-full p-3 min-h-[120px] max-h-[300px] overflow-y-auto focus:outline-none dark:bg-gray-700 dark:text-white resize-y"
            onInput={handleMessageInput}
            onBlur={handleMessageBlur}
            onFocus={handleMessageFocus}
            onKeyDown={handleKeyDown}
            data-placeholder="Write a personal message to be included with your data..."
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {settings.message.length} characters
          </span>
          <button
            type="button"
            onClick={saveMessage}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Message'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Shield className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Recipient Modal */}
      {showRecipientModal && (
        <RecipientModal
          onClose={() => setShowRecipientModal(false)}
          onAdd={addRecipient}
          editingRecipient={editingRecipient}
          currentRecipientCount={settings.recipients.length}
          currentRecipients={settings.recipients}
        />
      )}
    </div>
  );
};

// Recipient Modal Component
interface RecipientModalProps {
  onClose: () => void;
  onAdd: (recipient: any) => Promise<void>;
  editingRecipient: any;
  currentRecipientCount: number;
  currentRecipients: Array<{ id: string; email: string; name: string; relationship: string; }>;
}

const RecipientModal: React.FC<RecipientModalProps> = ({ onClose, onAdd, editingRecipient, currentRecipientCount, currentRecipients }) => {
  const [formData, setFormData] = useState({
    name: editingRecipient?.name || '',
    email: editingRecipient?.email || '',
    relationship: editingRecipient?.relationship || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check for duplicate email before submitting
    const emailExists = currentRecipients.some(
      existingRecipient => existingRecipient.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (emailExists) {
      toast.error('A recipient with this email already exists');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      // Error is handled in the onAdd function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Add Recipient
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {currentRecipientCount}/3 recipients added
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Spouse, Child, Friend"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Recipient'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 