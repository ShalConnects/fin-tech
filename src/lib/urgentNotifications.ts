import { supabase } from './supabase';
import { createNotification } from './notifications';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { LendBorrow } from '../types/index';
import { formatCurrency } from '../utils/currency';

interface UrgentItem {
  id: string;
  type: 'lend_borrow' | 'purchase';
  title: string;
  message: string;
  dueDate: string;
  daysUntil: number;
  amount?: number;
  currency?: string;
  personName?: string;
  itemName?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'overdue' | 'due_soon' | 'upcoming';
  lendBorrowType?: 'lend' | 'borrow'; // Track if it's lend or borrow
}

export class UrgentNotificationService {
  private static instance: UrgentNotificationService;
  private lastCheck: Date = new Date(0);
  private checkInterval: number = 1000 * 60 * 60; // Check every hour

  static getInstance(): UrgentNotificationService {
    if (!UrgentNotificationService.instance) {
      UrgentNotificationService.instance = new UrgentNotificationService();
    }
    return UrgentNotificationService.instance;
  }

  async checkAndCreateUrgentNotifications(userId: string): Promise<void> {
    // Temporarily disable urgent notifications to prevent 404 errors
    console.log('Urgent notifications service temporarily disabled');
    return;
    
    const now = new Date();
    
    // Only check if enough time has passed since last check
    if (now.getTime() - this.lastCheck.getTime() < this.checkInterval) {
      return;
    }

    this.lastCheck = now;

    try {
      // Clear old urgent notifications that are no longer relevant
      await this.clearOldUrgentNotifications(userId);
      
      // Get urgent items
      const urgentItems = await this.getUrgentItems(userId);
      
      // Create notifications for urgent items
      for (const item of urgentItems) {
        await this.createUrgentNotification(userId, item);
      }
    } catch (error) {
      console.error('Error checking urgent notifications:', error);
    }
  }

  // Method to manually trigger urgent notification check (for testing)
  async forceCheckUrgentNotifications(userId: string): Promise<void> {
    this.lastCheck = new Date(0); // Reset last check time
    await this.checkAndCreateUrgentNotifications(userId);
  }

  // Method to clear all urgent notifications for a user (for testing)
  async clearAllUrgentNotifications(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ deleted: true })
        .eq('user_id', userId)
        .contains('body', '[ID:');
    } catch (error) {
      console.error('Error clearing all urgent notifications:', error);
    }
  }

  private async clearOldUrgentNotifications(userId: string): Promise<void> {
    try {
      // Get all lend/borrow records that are no longer active or overdue
      const { data: inactiveLendBorrow, error: lbError } = await supabase
        .from('lend_borrow')
        .select('id')
        .eq('user_id', userId)
        .not('status', 'eq', 'active')
        .not('status', 'eq', 'overdue');

      if (lbError) {
        console.error('Error fetching inactive lend/borrow records:', lbError);
      }

      // Get all purchases that are no longer planned
      const { data: completedPurchases, error: pError } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .not('status', 'eq', 'planned');

      if (pError) {
        console.error('Error fetching completed purchases:', pError);
      }

      // Instead of trying to find specific notifications, just get all notifications for the user
      // and filter them in memory to avoid 404 errors
      const { data: allNotifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, body')
        .eq('user_id', userId)
        .is('deleted', false);

      if (notifError) {
        console.error('Error fetching notifications:', notifError);
        return;
      }

      // Clear notifications for inactive lend/borrow records
      if (inactiveLendBorrow && inactiveLendBorrow.length > 0 && allNotifications) {
        for (const record of inactiveLendBorrow) {
          const uniqueIdentifier = `lend_borrow_${record.id}`;
          
          // Find notifications that contain this identifier
          const notificationsToDelete = allNotifications.filter(n => 
            n.body && n.body.includes(`[ID:${uniqueIdentifier}]`)
          );
          
          if (notificationsToDelete.length > 0) {
            const notificationIds = notificationsToDelete.map(n => n.id);
            const { error: deleteError } = await supabase
              .from('notifications')
              .update({ deleted: true })
              .in('id', notificationIds);
            
            if (deleteError) {
              console.error(`Error deleting notifications for lend_borrow ${record.id}:`, deleteError);
            }
          }
        }
      }

      // Clear notifications for completed purchases
      if (completedPurchases && completedPurchases.length > 0 && allNotifications) {
        for (const purchase of completedPurchases) {
          const uniqueIdentifier = `purchase_${purchase.id}`;
          
          // Find notifications that contain this identifier
          const notificationsToDelete = allNotifications.filter(n => 
            n.body && n.body.includes(`[ID:${uniqueIdentifier}]`)
          );
          
          if (notificationsToDelete.length > 0) {
            const notificationIds = notificationsToDelete.map(n => n.id);
            const { error: deleteError } = await supabase
              .from('notifications')
              .update({ deleted: true })
              .in('id', notificationIds);
            
            if (deleteError) {
              console.error(`Error deleting notifications for purchase ${purchase.id}:`, deleteError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error clearing old urgent notifications:', error);
    }
  }

  private async getUrgentItems(userId: string): Promise<UrgentItem[]> {
    const urgentItems: UrgentItem[] = [];
    const today = new Date();

    // Get lend/borrow records
    const { data: lendBorrowData } = await supabase
      .from('lend_borrow')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'overdue'])
      .order('due_date', { ascending: true });

    // Process lend/borrow records
    if (lendBorrowData) {
      for (const record of lendBorrowData) {
        if (!record.due_date) continue;

        const dueDate = new Date(record.due_date);
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Only include if due within 7 days or overdue
        if (daysUntil <= 7 || daysUntil < 0) {
          let status: UrgentItem['status'];
          if (daysUntil < 0) {
            status = 'overdue';
          } else if (daysUntil <= 3) {
            status = 'due_soon';
          } else {
            status = 'upcoming';
          }

          // Ensure currency is not empty
          const safeCurrency = record.currency && record.currency.trim() !== '' ? record.currency : 'USD';

          urgentItems.push({
            id: record.id,
            type: 'lend_borrow',
            title: `${record.person_name} ${record.type === 'lend' ? 'owes you' : 'you owe'}`,
            message: `${record.type === 'lend' ? 'You lent' : 'You borrowed'} ${formatCurrency(record.amount, safeCurrency)}`,
            dueDate: record.due_date,
            daysUntil,
            amount: record.amount,
            currency: safeCurrency,
            personName: record.person_name,
            status,
            lendBorrowType: record.type
          });
        }
      }
    }

    // Get planned purchases
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'planned')
      .order('purchase_date', { ascending: true });

    // Process planned purchases
    if (purchasesData) {
      for (const purchase of purchasesData) {
        const purchaseDate = new Date(purchase.purchase_date);
        const daysUntil = Math.ceil((purchaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Only include if due within 7 days or overdue
        if (daysUntil <= 7 || daysUntil < 0) {
          let status: UrgentItem['status'];
          if (daysUntil < 0) {
            status = 'overdue';
          } else if (daysUntil <= 3) {
            status = 'due_soon';
          } else {
            status = 'upcoming';
          }

          urgentItems.push({
            id: purchase.id,
            type: 'purchase',
            title: 'Planned Purchase Due',
            message: purchase.item_name,
            dueDate: purchase.purchase_date,
            daysUntil,
            priority: purchase.priority,
            itemName: purchase.item_name,
            status
          });
        }
      }
    }

    // Sort by urgency: overdue first, then by days until due
    urgentItems.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return a.daysUntil - b.daysUntil;
    });

    return urgentItems;
  }

  private async createUrgentNotification(userId: string, item: UrgentItem): Promise<void> {
    // Create a unique identifier for this urgent item
    const uniqueIdentifier = `${item.type}_${item.id}`;
    
    // Check if any notification (read or unread, not deleted) already exists for this specific item
    const { data: existingNotifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .is('deleted', false);

    if (error) {
      console.error('Error checking for existing urgent notifications:', error);
      return;
    }

    // Find if any notification contains the unique identifier in the body
    const alreadyExists = (existingNotifications || []).some((n) => n.body?.includes(`[ID:${uniqueIdentifier}]`));
    if (alreadyExists) {
      // Don't create duplicate notifications - one already exists
      return;
    }

    let notificationType: 'warning' | 'error' | 'info' = 'info';
    let urgencyPrefix = '';

    if (item.status === 'overdue') {
      notificationType = 'error';
      urgencyPrefix = '🚨 URGENT: ';
    } else if (item.status === 'due_soon') {
      notificationType = 'warning';
      urgencyPrefix = '⚠️ DUE SOON: ';
    } else {
      notificationType = 'info';
      urgencyPrefix = '📅 UPCOMING: ';
    }

    const title = `${urgencyPrefix}${item.title}`;
    const body = `${item.message} - ${this.getTimeDescription(item.daysUntil)} [ID:${uniqueIdentifier}]`;

    // Create the notification
    await createNotification(
      userId,
      title,
      notificationType,
      body,
      false // Don't show toast for urgent notifications
    );
  }

  private getTimeDescription(daysUntil: number): string {
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntil} days`;
    }
  }
}

// Export singleton instance
export const urgentNotificationService = UrgentNotificationService.getInstance(); 