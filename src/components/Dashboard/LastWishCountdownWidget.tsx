import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { AlertTriangle } from 'lucide-react';

export const LastWishCountdownWidget: React.FC = () => {
  const { user } = useAuthStore();
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
      if (!error && data && data.is_enabled && data.last_check_in && data.check_in_frequency) {
        setEnabled(true);
        const lastCheckIn = new Date(data.last_check_in);
        const nextCheckIn = new Date(lastCheckIn.getTime() + data.check_in_frequency * 24 * 60 * 60 * 1000);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((nextCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setCountdown({ daysLeft, nextCheckIn: nextCheckIn.toLocaleDateString() });
      } else {
        setCountdown(null);
        setEnabled(false);
      }
    };
    fetchLastWish();
  }, [user]);

  if (!enabled || !countdown) return null;

  return (
    <div className="mb-8 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-900/40 dark:via-gray-900 dark:to-purple-900/20 rounded-2xl shadow-xl p-5 flex items-center gap-4 border-2 border-purple-400 dark:border-purple-600">
      <AlertTriangle className="w-7 h-7 text-purple-500" />
      <div>
        <div className="text-base font-bold text-purple-900 dark:text-purple-100">Last Wish Check-in</div>
        <div className="text-sm text-purple-700 dark:text-purple-200 font-medium">{countdown.daysLeft} days left (next: {countdown.nextCheckIn})</div>
      </div>
    </div>
  );
}; 