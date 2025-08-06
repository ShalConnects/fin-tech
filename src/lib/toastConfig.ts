import { toast } from 'sonner';

// Advanced toast configuration
export const toastConfig = {
  // Position options
  positions: {
    'top-left': 'top-left',
    'top-center': 'top-center',
    'top-right': 'top-right',
    'bottom-left': 'bottom-left',
    'bottom-center': 'bottom-center',
    'bottom-right': 'bottom-right'
  },

  // Duration presets
  durations: {
    short: 2000,
    normal: 4000,
    long: 6000,
    persistent: Infinity
  },

  // Theme configurations
  themes: {
    light: {
      success: {
        background: '#10B981',
        color: 'white',
        border: '1px solid #059669',
        icon: '✓'
      },
      error: {
        background: '#EF4444',
        color: 'white',
        border: '1px solid #DC2626',
        icon: '✕'
      },
      warning: {
        background: '#F59E0B',
        color: 'white',
        border: '1px solid #D97706',
        icon: '⚠'
      },
      info: {
        background: '#3B82F6',
        color: 'white',
        border: '1px solid #2563EB',
        icon: 'ℹ'
      },
      loading: {
        background: '#6B7280',
        color: 'white',
        border: '1px solid #4B5563',
        icon: '⟳'
      }
    },
    dark: {
      success: {
        background: '#059669',
        color: 'white',
        border: '1px solid #047857',
        icon: '✓'
      },
      error: {
        background: '#DC2626',
        color: 'white',
        border: '1px solid #B91C1C',
        icon: '✕'
      },
      warning: {
        background: '#D97706',
        color: 'white',
        border: '1px solid #B45309',
        icon: '⚠'
      },
      info: {
        background: '#2563EB',
        color: 'white',
        border: '1px solid #1D4ED8',
        icon: 'ℹ'
      },
      loading: {
        background: '#4B5563',
        color: 'white',
        border: '1px solid #374151',
        icon: '⟳'
      }
    }
  }
};

// Enhanced toast functions with better customization
export const enhancedToast = {
  // Success notifications
  success: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    position?: keyof typeof toastConfig.positions;
  }) => {
    return toast.success(message, {
      duration: options?.duration || toastConfig.durations.normal,
      description: options?.description,
      action: options?.action,
      position: options?.position || 'top-right',
      style: {
        ...toastConfig.themes.light.success,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  },

  // Error notifications
  error: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    position?: keyof typeof toastConfig.positions;
  }) => {
    return toast.error(message, {
      duration: options?.duration || toastConfig.durations.long,
      description: options?.description,
      action: options?.action,
      position: options?.position || 'top-right',
      style: {
        ...toastConfig.themes.light.error,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  },

  // Warning notifications
  warning: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    position?: keyof typeof toastConfig.positions;
  }) => {
    return toast.warning(message, {
      duration: options?.duration || toastConfig.durations.normal,
      description: options?.description,
      action: options?.action,
      position: options?.position || 'top-right',
      style: {
        ...toastConfig.themes.light.warning,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  },

  // Info notifications
  info: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    position?: keyof typeof toastConfig.positions;
  }) => {
    return toast.info(message, {
      duration: options?.duration || toastConfig.durations.normal,
      description: options?.description,
      action: options?.action,
      position: options?.position || 'top-right',
      style: {
        ...toastConfig.themes.light.info,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  },

  // Loading notifications
  loading: (message: string, options?: {
    position?: keyof typeof toastConfig.positions;
  }) => {
    return toast.loading(message, {
      duration: toastConfig.durations.persistent,
      position: options?.position || 'top-right',
      style: {
        ...toastConfig.themes.light.loading,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  },

  // Dismiss specific toast
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },

  // Promise-based toast for async operations
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
      position = 'top-right' as keyof typeof toastConfig.positions
    }: {
      loading: string;
      success: string;
      error: string;
      position?: keyof typeof toastConfig.positions;
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      position
    });
  }
};

// Toast queue management
export class ToastQueue {
  private queue: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    message: string;
    description?: string;
    priority: number;
    timestamp: number;
  }> = [];

  // Add toast to queue
  add(
    type: 'success' | 'error' | 'warning' | 'info' | 'loading',
    message: string,
    description?: string,
    priority: number = 1
  ) {
    const toastItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      description,
      priority,
      timestamp: Date.now()
    };

    this.queue.push(toastItem);
    this.processQueue();
  }

  // Process queue with smart timing
  private processQueue() {
    // Sort by priority (higher first) and timestamp (older first)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    // Show toasts with staggered timing to prevent spam
    this.queue.forEach((toastItem, index) => {
      setTimeout(() => {
        enhancedToast[toastItem.type](toastItem.message, {
          description: toastItem.description,
          duration: toastConfig.durations.normal
        });
      }, index * 300); // 300ms delay between toasts
    });

    this.queue = [];
  }

  // Clear all toasts
  clear() {
    enhancedToast.dismissAll();
    this.queue = [];
  }
}

// Export singleton instance
export const toastQueue = new ToastQueue();

// Context-specific toast helpers with position options
export const contextToasts = {
  // Financial operations
  financial: {
    transactionCreated: (amount: number, currency: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.success('Transaction Created', {
        description: `Amount: ${new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency 
        }).format(amount)}`,
        position: position || 'top-right'
      }),

    transactionUpdated: (amount: number, currency: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.info('Transaction Updated', {
        description: `Amount: ${new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency 
        }).format(amount)}`,
        position: position || 'top-right'
      }),

    transactionDeleted: (position?: keyof typeof toastConfig.positions) =>
      enhancedToast.warning('Transaction Deleted', {
        position: position || 'top-right'
      }),

    transferSuccessful: (amount: number, currency: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.success('Transfer Successful', {
        description: `Amount: ${new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency 
        }).format(amount)}`,
        position: position || 'top-right'
      }),

    accountCreated: (name: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.success('Account Created', {
        description: `Account: ${name}`,
        position: position || 'top-right'
      }),

    accountUpdated: (name: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.info('Account Updated', {
        description: `Account: ${name}`,
        position: position || 'top-right'
      }),

    accountDeleted: (name: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.warning('Account Deleted', {
        description: `Account: ${name}`,
        position: position || 'top-right'
      })
  },

  // Purchase operations
  purchase: {
    itemAdded: (itemName: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.success('Purchase Added', {
        description: `Item: ${itemName}`,
        position: position || 'top-right'
      }),

    itemUpdated: (itemName: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.info('Purchase Updated', {
        description: `Item: ${itemName}`,
        position: position || 'top-right'
      }),

    itemCompleted: (itemName: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.success('Purchase Completed', {
        description: `Item: ${itemName}`,
        position: position || 'top-right'
      }),

    itemDeleted: (itemName: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.warning('Purchase Deleted', {
        description: `Item: ${itemName}`,
        position: position || 'top-right'
      })
  },

  // Error handling
  errors: {
    networkError: (position?: keyof typeof toastConfig.positions) =>
      enhancedToast.error('Network Error', {
        description: 'Please check your internet connection',
        duration: toastConfig.durations.long,
        position: position || 'top-center'
      }),

    serverError: (position?: keyof typeof toastConfig.positions) =>
      enhancedToast.error('Server Error', {
        description: 'Something went wrong on our end',
        duration: toastConfig.durations.long,
        position: position || 'top-center'
      }),

    validationError: (field: string, position?: keyof typeof toastConfig.positions) =>
      enhancedToast.error('Validation Error', {
        description: `Please check the ${field} field`,
        duration: toastConfig.durations.normal,
        position: position || 'bottom-center'
      }),

    permissionError: (position?: keyof typeof toastConfig.positions) =>
      enhancedToast.error('Permission Denied', {
        description: 'You don\'t have permission to perform this action',
        duration: toastConfig.durations.normal,
        position: position || 'top-center'
      })
  },

  // Loading states
  loading: {
    saving: (position?: keyof typeof toastConfig.positions) => 
      enhancedToast.loading('Saving...', { position: position || 'top-right' }),
    loading: (position?: keyof typeof toastConfig.positions) => 
      enhancedToast.loading('Loading...', { position: position || 'top-right' }),
    processing: (position?: keyof typeof toastConfig.positions) => 
      enhancedToast.loading('Processing...', { position: position || 'top-right' }),
    uploading: (position?: keyof typeof toastConfig.positions) => 
      enhancedToast.loading('Uploading...', { position: position || 'top-right' }),
    deleting: (position?: keyof typeof toastConfig.positions) => 
      enhancedToast.loading('Deleting...', { position: position || 'top-right' })
  },

  // Position-specific helpers
  positions: {
    // Top positions for important notifications
    top: {
      success: (message: string, description?: string) =>
        enhancedToast.success(message, { description, position: 'top-center' }),
      error: (message: string, description?: string) =>
        enhancedToast.error(message, { description, position: 'top-center' }),
      warning: (message: string, description?: string) =>
        enhancedToast.warning(message, { description, position: 'top-center' }),
      info: (message: string, description?: string) =>
        enhancedToast.info(message, { description, position: 'top-center' })
    },

    // Bottom positions for less intrusive notifications
    bottom: {
      success: (message: string, description?: string) =>
        enhancedToast.success(message, { description, position: 'bottom-right' }),
      error: (message: string, description?: string) =>
        enhancedToast.error(message, { description, position: 'bottom-right' }),
      warning: (message: string, description?: string) =>
        enhancedToast.warning(message, { description, position: 'bottom-right' }),
      info: (message: string, description?: string) =>
        enhancedToast.info(message, { description, position: 'bottom-right' })
    },

    // Left positions for sidebar-like notifications
    left: {
      success: (message: string, description?: string) =>
        enhancedToast.success(message, { description, position: 'top-left' }),
      error: (message: string, description?: string) =>
        enhancedToast.error(message, { description, position: 'top-left' }),
      warning: (message: string, description?: string) =>
        enhancedToast.warning(message, { description, position: 'top-left' }),
      info: (message: string, description?: string) =>
        enhancedToast.info(message, { description, position: 'top-left' })
    }
  }
}; 