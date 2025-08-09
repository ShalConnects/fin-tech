import { supabase } from './supabase';
import { toast } from 'sonner';
import type { NotificationType } from '../types/index';

// Enhanced notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Toast configuration
const toastConfig = {
  success: {
    duration: 4000,
    style: {
      background: '#10B981',
      color: 'white',
      border: '1px solid #059669'
    }
  },
  error: {
    duration: 6000,
    style: {
      background: '#EF4444',
      color: 'white',
      border: '1px solid #DC2626'
    }
  },
  warning: {
    duration: 5000,
    style: {
      background: '#F59E0B',
      color: 'white',
      border: '1px solid #D97706'
    }
  },
  info: {
    duration: 4000,
    style: {
      background: '#3B82F6',
      color: 'white',
      border: '1px solid #2563EB'
    }
  },
  loading: {
    duration: Infinity,
    style: {
      background: '#6B7280',
      color: 'white',
      border: '1px solid #4B5563'
    }
  }
};

// Enhanced toast functions
export const showToast = {
  success: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    return toast.success(message, {
      ...toastConfig.success,
      description: options?.description,
      action: options?.action,
      position: 'top-right'
    });
  },

  error: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    return toast.error(message, {
      ...toastConfig.error,
      description: options?.description,
      action: options?.action,
      position: 'top-right'
    });
  },

  warning: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    return toast.warning(message, {
      ...toastConfig.warning,
      description: options?.description,
      action: options?.action,
      position: 'top-right'
    });
  },

  info: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    return toast.info(message, {
      ...toastConfig.info,
      description: options?.description,
      action: options?.action,
      position: 'top-right'
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      ...toastConfig.loading,
      position: 'top-right'
    });
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  }
};

// Enhanced notification creation with toast integration
export async function createNotification(
  userId: string,
  title: string,
  type: NotificationType = 'info',
  body?: string,
  shouldShowToast: boolean = true
) {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      type,
      body
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    // Show toast notification if requested
    if (shouldShowToast) {
      const toastType = type as ToastType;
      showToast[toastType](title, { description: body });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Smart notification system
export class SmartNotificationManager {
  private static instance: SmartNotificationManager;
  private notificationQueue: Array<{
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    priority: number;
    timestamp: number;
  }> = [];

  private constructor() {}

  static getInstance(): SmartNotificationManager {
    if (!SmartNotificationManager.instance) {
      SmartNotificationManager.instance = new SmartNotificationManager();
    }
    return SmartNotificationManager.instance;
  }

  // Add notification to queue with priority
  addToQueue(type: ToastType, message: string, description?: string, priority: number = 1) {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      description,
      priority,
      timestamp: Date.now()
    };

    this.notificationQueue.push(notification);
    this.processQueue();
  }

  // Process queue based on priority
  private processQueue() {
    // Sort by priority (higher first) and timestamp (older first)
    this.notificationQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    // Show notifications with delay to prevent spam
    this.notificationQueue.forEach((notification, index) => {
      setTimeout(() => {
        showToast[notification.type](notification.message, { description: notification.description });
      }, index * 500); // 500ms delay between notifications
    });

    this.notificationQueue = [];
  }

  // Clear all toasts
  clearAll() {
    toast.dismiss();
  }

  // Show notification with smart timing
  smartNotify(type: ToastType, message: string, description?: string) {
    // Check if similar notification was shown recently
    const recentNotifications = this.notificationQueue.filter(
      n => n.message === message && Date.now() - n.timestamp < 5000
    );

    if (recentNotifications.length === 0) {
      this.addToQueue(type, message, description);
    }
  }
}

// Export singleton instance
export const notificationManager = SmartNotificationManager.getInstance();

// Context-aware notification helpers
export const contextAwareNotifications = {
  // Transaction-related notifications
  transaction: {
    created: (amount: number, currency: string) => 
      showToast.success(`Transaction created`, { 
        description: `Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}` 
      }),
    
    updated: (amount: number, currency: string) => 
      showToast.info(`Transaction updated`, { 
        description: `Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}` 
      }),
    
    deleted: () => 
      showToast.warning(`Transaction deleted`),
    
    error: (error: string) => 
      showToast.error(`Transaction failed`, { description: error })
  },

  // Account-related notifications
  account: {
    created: (name: string) => 
      showToast.success(`Account created`, { description: `Account: ${name}` }),
    
    updated: (name: string) => 
      showToast.info(`Account updated`, { description: `Account: ${name}` }),
    
    deleted: (name: string) => 
      showToast.warning(`Account deleted`, { description: `Account: ${name}` }),
    
    error: (error: string) => 
      showToast.error(`Account operation failed`, { description: error })
  },

  // Purchase-related notifications
  purchase: {
    created: (itemName: string) => 
      showToast.success(`Purchase added`, { description: `Item: ${itemName}` }),
    
    updated: (itemName: string) => 
      showToast.info(`Purchase updated`, { description: `Item: ${itemName}` }),
    
    completed: (itemName: string) => 
      showToast.success(`Purchase completed`, { description: `Item: ${itemName}` }),
    
    error: (error: string) => 
      showToast.error(`Purchase operation failed`, { description: error })
  },

  // Transfer-related notifications
  transfer: {
    successful: (amount: number, currency: string) => 
      showToast.success(`Transfer successful`, { 
        description: `Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}` 
      }),
    
    error: (error: string) => 
      showToast.error(`Transfer failed`, { description: error })
  },

  // General notifications
  general: {
    loading: (message: string) => showToast.loading(message),
    success: (message: string, description?: string) => 
      showToast.success(message, { description }),
    error: (message: string, description?: string) => 
      showToast.error(message, { description }),
    warning: (message: string, description?: string) => 
      showToast.warning(message, { description }),
    info: (message: string, description?: string) => 
      showToast.info(message, { description })
  }
}; 