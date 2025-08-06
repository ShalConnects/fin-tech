import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'announcement' | 'tip';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  icon?: string;
  createdAt: Date;
  read: boolean;
  dismissed: boolean;
  priority: 'low' | 'medium' | 'high';
  targetAudience?: 'all' | 'new' | 'existing' | 'power';
}

export interface FavoriteQuote {
  id: string;
  quote: string;
  author: string;
  createdAt: Date;
  category?: 'financial' | 'motivation' | 'success' | 'wisdom';
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  favoriteQuotes: FavoriteQuote[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  initializeDefaultNotifications: () => void;
  addFavoriteQuote: (quote: Omit<FavoriteQuote, 'id' | 'createdAt'>) => void;
  removeFavoriteQuote: (id: string) => void;
  isQuoteFavorited: (quote: string, author: string) => boolean;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      favoriteQuotes: [],

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          read: false,
          dismissed: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          const newUnreadCount = updatedNotifications.filter((n) => !n.read && !n.dismissed).length;
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) => ({
            ...notification,
            read: true,
          }));
          const newUnreadCount = updatedNotifications.filter((n) => !n.read && !n.dismissed).length;
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        });
      },

      dismissNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, dismissed: true } : notification
          );
          const newUnreadCount = updatedNotifications.filter((n) => !n.read && !n.dismissed).length;
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read && !n.dismissed).length;
      },

      addFavoriteQuote: (quoteData) => {
        const newFavoriteQuote: FavoriteQuote = {
          ...quoteData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };

        set((state) => ({
          favoriteQuotes: [newFavoriteQuote, ...state.favoriteQuotes],
        }));
      },

      removeFavoriteQuote: (id) => {
        set((state) => ({
          favoriteQuotes: state.favoriteQuotes.filter((quote) => quote.id !== id),
        }));
      },

      isQuoteFavorited: (quote: string, author: string) => {
        const { favoriteQuotes } = get();
        return favoriteQuotes.some((favorite) => 
          favorite.quote === quote && favorite.author === author
        );
      },

      initializeDefaultNotifications: () => {
        const { notifications } = get();
        
        // Only initialize if no notifications exist
        if (notifications.length === 0) {
          const defaultNotifications: Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>[] = [
            {
              type: 'feature',
              title: '🎉 Multi-Currency Support',
              message: 'Track your finances in multiple currencies! Now you can manage accounts in USD, EUR, GBP, and more.',
              actionText: 'Try Multi-Currency',
              actionUrl: '/currency-analytics',
              icon: '💱',
              priority: 'high',
              targetAudience: 'all',
            },
            {
              type: 'feature',
              title: '💝 Enhanced Donation Page',
              message: 'We\'ve completely redesigned the donation page with better tracking, categories, and insights.',
              actionText: 'Explore Donations',
              actionUrl: '/donations',
              icon: '🎁',
              priority: 'medium',
              targetAudience: 'all',
            },
            {
              type: 'feature',
              title: '✨ Daily Motivation Cards',
              message: 'Stay inspired with daily financial wisdom! New motivational quotes appear on your dashboard.',
              actionText: 'View Dashboard',
              actionUrl: '/',
              icon: '💫',
              priority: 'medium',
              targetAudience: 'all',
            },
            {
              type: 'tip',
              title: '💡 Pro Tip: Use Categories',
              message: 'Organize your transactions with categories to get better insights into your spending patterns.',
              actionText: 'Learn More',
              actionUrl: '/transactions',
              icon: '📊',
              priority: 'low',
              targetAudience: 'new',
            },
          ];

          defaultNotifications.forEach((notification) => {
            get().addNotification(notification);
          });
        }
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        favoriteQuotes: state.favoriteQuotes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects after rehydration
          state.notifications = state.notifications.map(notification => ({
            ...notification,
            createdAt: new Date(notification.createdAt)
          }));
          state.favoriteQuotes = state.favoriteQuotes.map(quote => ({
            ...quote,
            createdAt: new Date(quote.createdAt)
          }));
          
          // Recalculate unread count to ensure consistency
          state.unreadCount = state.notifications.filter((n) => !n.read && !n.dismissed).length;
        }
      },
    }
  )
); 