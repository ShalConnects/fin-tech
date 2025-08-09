import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LastWishCountdownWidget: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<null | { daysLeft: number, nextCheckIn: string }>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      setCountdown(null);
      setEnabled(false);
      return;
    }

    const fetchLastWish = async () => {
      const { data, error } = await supabase
        .from('last_wish_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('LastWishCountdownWidget - Fetched data:', data, 'Error:', error);
      console.log('LastWishCountdownWidget - Conditions check:', {
        hasData: !!data,
        isEnabled: data?.is_enabled,
        hasLastCheckIn: !!data?.last_check_in,
        hasFrequency: !!data?.check_in_frequency,
        userId: user.id
      });
      
      if (!error && data && data.is_enabled && data.check_in_frequency) {
        if (data.last_check_in) {
          console.log('LastWishCountdownWidget - All conditions met, setting enabled');
          setEnabled(true);
          const lastCheckIn = new Date(data.last_check_in);
          const nextCheckIn = new Date(lastCheckIn.getTime() + data.check_in_frequency * 24 * 60 * 60 * 1000);
          const now = new Date();
          const daysLeft = Math.max(0, Math.ceil((nextCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setCountdown({ daysLeft, nextCheckIn: nextCheckIn.toLocaleDateString() });
        } else {
          console.log('LastWishCountdownWidget - Enabled but no last check-in, showing initial state');
          setEnabled(true);
          setCountdown({ daysLeft: data.check_in_frequency, nextCheckIn: 'Not set yet' });
        }
      } else {
        console.log('LastWishCountdownWidget - Conditions not met, setting disabled');
        setCountdown(null);
        setEnabled(false);
      }
    };
    fetchLastWish();
  }, [user]);

  // Debug: Show widget even when disabled to help troubleshoot
  if (!enabled || !countdown) {
    return (
      <div className="mb-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-semibold mb-2">Last Wish Widget Debug:</div>
          <div>Enabled: {enabled ? 'Yes' : 'No'}</div>
          <div>Countdown: {countdown ? 'Yes' : 'No'}</div>
          <div>User ID: {user?.id || 'None'}</div>
          <div className="text-xs mt-2">Check browser console for detailed logs</div>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    navigate('/settings?tab=last-wish');
  };

  return (
    <div 
      className="mb-5 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-900/40 dark:via-gray-900 dark:to-purple-900/20 rounded-2xl shadow-xl p-5 flex items-center gap-4 border-2 border-purple-400 dark:border-purple-600 cursor-pointer hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]"
      onClick={handleClick}
    >
      <AlertTriangle className="w-7 h-7 text-purple-500" />
      <div>
        <div className="text-base font-bold text-purple-900 dark:text-purple-100">Last Wish Check-in</div>
        {countdown.nextCheckIn === 'Not set yet' ? (
          <div className="text-sm text-purple-700 dark:text-purple-200 font-medium">
            Ready to start! Click "Check In Now" in Last Wish settings
          </div>
        ) : (
          <div className="text-sm text-purple-700 dark:text-purple-200 font-medium">
            {countdown.daysLeft} days left (next: {countdown.nextCheckIn})
          </div>
        )}
      </div>
    </div>
  );
}; 