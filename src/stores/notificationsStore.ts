import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notification } from '../types/index';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get current user from auth store
      const { user } = await import('../store/authStore').then(module => module.useAuthStore.getState());
      
      if (!user) {
        set({ notifications: [], unreadCount: 0, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted', false) // Exclude deleted notifications
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        // Don't throw error, just set empty notifications
        set({ notifications: [], unreadCount: 0, isLoading: false });
        return;
      }

      const unreadCount = data.filter(n => !n.is_read).length;
      set({ notifications: data, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      set({ notifications: [], unreadCount: 0, error: (error as Error).message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      }));
    } catch (error) {
      console.error('Error in markAsRead:', error);
      set({ error: (error as Error).message });
    }
  },

  markAllAsRead: async () => {
    try {
      // Get current user from auth store
      const { user } = await import('../store/authStore').then(module => module.useAuthStore.getState());
      
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      set({ error: (error as Error).message });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.notifications.find(n => n.id === id)?.is_read
          ? state.unreadCount
          : state.unreadCount - 1
      }));
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      set({ error: (error as Error).message });
    }
  },

  clearAllNotifications: async () => {
    try {
      // Get current user from auth store
      const { user } = await import('../store/authStore').then(module => module.useAuthStore.getState());
      
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing all notifications:', error);
        return;
      }

      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Error in clearAllNotifications:', error);
      set({ error: (error as Error).message });
    }
  }
})); 