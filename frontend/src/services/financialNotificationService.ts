import { supabase } from '@/integrations/supabase/client';

export interface FinancialNotification {
  id: string;
  type: 'payment_received' | 'payment_due' | 'invoice_overdue' | 'low_cash_flow' | 'budget_exceeded' | 'large_transaction' | 'account_balance_low' | 'reconciliation_needed';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data: Record<string, any>;
  recipientIds: string[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actionUrl?: string;
  expiresAt?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  eventType: string;
  conditions: Record<string, any>;
  notificationTemplate: {
    title: string;
    message: string;
    severity: FinancialNotification['severity'];
    channels: FinancialNotification['channels'];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Real-time notification service for financial events
 */
export class FinancialNotificationService {

  // Event Listeners and Real-time subscriptions

  /**
   * Initialize real-time listeners for financial events
   */
  static initializeRealtimeListeners() {
    try {
      // Listen for new financial transactions
      supabase
        .channel('financial_transactions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'financial_transactions'
          },
          (payload) => {
            this.handleNewTransaction(payload.new);
          }
        )
        .subscribe();

      // Listen for account balance changes
      supabase
        .channel('chart_of_accounts')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chart_of_accounts'
          },
          (payload) => {
            this.handleAccountBalanceChange(payload.old, payload.new);
          }
        )
        .subscribe();

      // Listen for payment status changes
      supabase
        .channel('payments')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'payments'
          },
          (payload) => {
            this.handlePaymentStatusChange(payload.old, payload.new);
          }
        )
        .subscribe();

      console.log('Financial real-time listeners initialized');
    } catch (error) {
      console.error('Error initializing real-time listeners:', error);
    }
  }

  /**
   * Handle new financial transaction
   */
  private static async handleNewTransaction(transaction: any) {
    try {
      // Check for large transaction notifications
      if (transaction.total_amount > 100000) { // Configurable threshold
        await this.createNotification({
          type: 'large_transaction',
          severity: 'warning',
          title: 'Large Transaction Alert',
          message: `A large transaction of ${transaction.currency} ${transaction.total_amount.toLocaleString()} has been recorded`,
          data: { transactionId: transaction.id, amount: transaction.total_amount },
          recipientIds: await this.getFinanceTeamIds(),
          channels: ['email', 'in_app'],
          actionUrl: `/financial/transactions/${transaction.id}`
        });
      }

      // Check for cash flow impact
      await this.checkCashFlowImpact(transaction);

    } catch (error) {
      console.error('Error handling new transaction:', error);
    }
  }

  /**
   * Handle account balance changes
   */
  private static async handleAccountBalanceChange(oldAccount: any, newAccount: any) {
    try {
      const balanceChange = newAccount.balance - oldAccount.balance;
      
      // Check for low balance alerts
      if (newAccount.account_type === 'asset' && newAccount.balance < 10000) { // Configurable threshold
        await this.createNotification({
          type: 'account_balance_low',
          severity: 'warning',
          title: 'Low Account Balance',
          message: `Account ${newAccount.account_name} has a low balance of ${newAccount.balance}`,
          data: { accountId: newAccount.id, balance: newAccount.balance },
          recipientIds: await this.getFinanceTeamIds(),
          channels: ['email', 'in_app']
        });
      }

      // Significant balance changes
      if (Math.abs(balanceChange) > 50000) { // Configurable threshold
        await this.createNotification({
          type: 'large_transaction',
          severity: 'info',
          title: 'Significant Balance Change',
          message: `Account ${newAccount.account_name} balance changed by ${balanceChange > 0 ? '+' : ''}${balanceChange.toLocaleString()}`,
          data: { accountId: newAccount.id, balanceChange },
          recipientIds: await this.getFinanceTeamIds(),
          channels: ['in_app']
        });
      }

    } catch (error) {
      console.error('Error handling account balance change:', error);
    }
  }

  /**
   * Handle payment status changes
   */
  private static async handlePaymentStatusChange(oldPayment: any, newPayment: any) {
    try {
      if (oldPayment.status !== newPayment.status) {
        const statusChanged = {
          'pending': 'Payment is now pending',
          'completed': 'Payment has been completed',
          'failed': 'Payment has failed',
          'cancelled': 'Payment has been cancelled'
        }[newPayment.status] || 'Payment status updated';

        await this.createNotification({
          type: 'payment_received',
          severity: newPayment.status === 'completed' ? 'success' : 
                   newPayment.status === 'failed' ? 'error' : 'info',
          title: 'Payment Status Updated',
          message: `Payment ${newPayment.payment_number}: ${statusChanged}`,
          data: { paymentId: newPayment.id, status: newPayment.status },
          recipientIds: await this.getPaymentStakeholders(newPayment),
          channels: ['email', 'in_app'],
          actionUrl: `/financial/payments/${newPayment.id}`
        });
      }
    } catch (error) {
      console.error('Error handling payment status change:', error);
    }
  }

  // Notification Management

  /**
   * Create a new notification
   */
  static async createNotification(notification: Omit<FinancialNotification, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>) {
    try {
      const newNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store notification in database
      const { error } = await supabase
        .from('financial_notifications')
        .insert({
          id: newNotification.id,
          type: newNotification.type,
          severity: newNotification.severity,
          title: newNotification.title,
          message: newNotification.message,
          data: newNotification.data,
          recipient_ids: newNotification.recipientIds,
          channels: newNotification.channels,
          is_read: newNotification.isRead,
          action_url: newNotification.actionUrl,
          expires_at: newNotification.expiresAt,
          created_at: newNotification.createdAt,
          updated_at: newNotification.updatedAt
        });

      if (error) throw error;

      // Send notifications through various channels
      await this.sendNotificationThroughChannels(newNotification);

      // Broadcast to real-time subscribers
      await this.broadcastNotification(newNotification);

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      type?: FinancialNotification['type'];
    } = {}
  ): Promise<FinancialNotification[]> {
    try {
      let query = supabase
        .from('financial_notifications')
        .select('*')
        .contains('recipient_ids', [userId])
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.transformNotificationData);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('financial_notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('financial_notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .contains('recipient_ids', [userId])
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Scheduled Notifications

  /**
   * Check for overdue invoices and send notifications
   */
  static async checkOverdueInvoices() {
    try {
      const { data: overdueInvoices, error } = await supabase
        .from('invoices')
        .select('*')
        .lt('due_date', new Date().toISOString())
        .eq('status', 'sent');

      if (error) throw error;

      for (const invoice of overdueInvoices || []) {
        await this.createNotification({
          type: 'invoice_overdue',
          severity: 'error',
          title: 'Invoice Overdue',
          message: `Invoice ${invoice.invoice_number} is overdue by ${this.calculateDaysOverdue(invoice.due_date)} days`,
          data: { invoiceId: invoice.id, daysOverdue: this.calculateDaysOverdue(invoice.due_date) },
          recipientIds: await this.getInvoiceStakeholders(invoice),
          channels: ['email', 'in_app'],
          actionUrl: `/financial/invoices/${invoice.id}`
        });
      }
    } catch (error) {
      console.error('Error checking overdue invoices:', error);
    }
  }

  /**
   * Check for upcoming payment due dates
   */
  static async checkUpcomingPayments() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: upcomingPayments, error } = await supabase
        .from('bills')
        .select('*')
        .lte('due_date', threeDaysFromNow.toISOString())
        .gte('due_date', new Date().toISOString())
        .eq('status', 'pending');

      if (error) throw error;

      for (const payment of upcomingPayments || []) {
        await this.createNotification({
          type: 'payment_due',
          severity: 'warning',
          title: 'Payment Due Soon',
          message: `Payment for ${payment.reference_number} is due in ${this.calculateDaysUntilDue(payment.due_date)} days`,
          data: { paymentId: payment.id, daysToDue: this.calculateDaysUntilDue(payment.due_date) },
          recipientIds: await this.getPaymentApprovers(),
          channels: ['email', 'in_app'],
          actionUrl: `/financial/bills/${payment.id}`
        });
      }
    } catch (error) {
      console.error('Error checking upcoming payments:', error);
    }
  }

  // Notification Delivery

  /**
   * Send notification through various channels
   */
  private static async sendNotificationThroughChannels(notification: FinancialNotification) {
    try {
      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'sms':
            await this.sendSMSNotification(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'in_app':
            // In-app notifications are handled by real-time broadcasting
            break;
        }
      }
    } catch (error) {
      console.error('Error sending notification through channels:', error);
    }
  }

  /**
   * Broadcast notification to real-time subscribers
   */
  private static async broadcastNotification(notification: FinancialNotification) {
    try {
      for (const recipientId of notification.recipientIds) {
        await supabase
          .channel(`user_notifications_${recipientId}`)
          .send({
            type: 'broadcast',
            event: 'new_notification',
            payload: notification
          });
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  // Helper Methods

  private static async getFinanceTeamIds(): Promise<string[]> {
    try {
      const { data: users, error } = await supabase
        .from('employees')
        .select('id')
        .eq('department', 'finance')
        .eq('is_active', true);

      if (error) throw error;
      return (users || []).map(user => user.id);
    } catch (error) {
      console.error('Error getting finance team IDs:', error);
      return [];
    }
  }

  private static async getPaymentStakeholders(payment: any): Promise<string[]> {
    // Get users who should be notified about this payment
    return this.getFinanceTeamIds(); // Simplified
  }

  private static async getInvoiceStakeholders(invoice: any): Promise<string[]> {
    // Get users who should be notified about this invoice
    return this.getFinanceTeamIds(); // Simplified
  }

  private static async getPaymentApprovers(): Promise<string[]> {
    // Get users who can approve payments
    return this.getFinanceTeamIds(); // Simplified
  }

  private static async checkCashFlowImpact(transaction: any) {
    // Check if this transaction significantly impacts cash flow
    // Implementation would analyze cash accounts and predict shortfalls
  }

  private static calculateDaysOverdue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static calculateDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static async sendEmailNotification(notification: FinancialNotification) {
    // Implement email sending logic
    console.log('Sending email notification:', notification.title);
  }

  private static async sendSMSNotification(notification: FinancialNotification) {
    // Implement SMS sending logic
    console.log('Sending SMS notification:', notification.title);
  }

  private static async sendPushNotification(notification: FinancialNotification) {
    // Implement push notification logic
    console.log('Sending push notification:', notification.title);
  }

  private static transformNotificationData(data: any): FinancialNotification {
    return {
      id: data.id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      data: data.data,
      recipientIds: data.recipient_ids,
      channels: data.channels,
      isRead: data.is_read,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      actionUrl: data.action_url,
      expiresAt: data.expires_at
    };
  }

  /**
   * Initialize scheduled checks for notifications
   */
  static initializeScheduledChecks() {
    // Check overdue invoices every hour
    setInterval(() => {
      this.checkOverdueInvoices();
    }, 60 * 60 * 1000);

    // Check upcoming payments twice daily
    setInterval(() => {
      this.checkUpcomingPayments();
    }, 12 * 60 * 60 * 1000);

    console.log('Financial notification scheduled checks initialized');
  }
}
