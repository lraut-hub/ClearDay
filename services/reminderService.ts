import { Task, AppSettings } from '../types';

class ReminderService {
  private checkInterval: any = null;
  private tasks: Task[] = [];
  private settings: AppSettings | null = null;
  private notifiedTaskIds = new Set<string>();
  private lastReflectionDate: string | null = null;

  init(tasks: Task[], settings: AppSettings) {
    this.tasks = tasks;
    this.settings = settings;

    // Start foreground polling loop
    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => this.checkReminders(), 60000); // check every minute
      // Run once immediately
      this.checkReminders();
    }

    // Attempt to schedule offline notifications if showTrigger is supported
    this.syncOfflineNotifications();
  }

  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
  }

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async checkReminders() {
    if (!this.settings || !this.isPWA() || Notification.permission !== 'granted') return;

    const now = new Date();

    // 1. Check Activity Reminders
    if (this.settings.activityRemindersEnabled) {
      for (const task of this.tasks) {
        if (task.status === 'completed' || !task.dueTime || this.notifiedTaskIds.has(task.id)) continue;

        const taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
        const offsetMs = this.settings.activityReminderOffset * 60000;
        const reminderTime = new Date(taskDate.getTime() - offsetMs);

        // If reminder time has passed but task time hasn't passed (give or take a minute)
        if (now >= reminderTime && now < taskDate) {
          this.notifiedTaskIds.add(task.id);
          this.showNotification(`${task.title} starts in ${this.settings.activityReminderOffset} minutes.`, task.id);
        }
      }
    }

    // 2. Check Reflection Reminder
    if (this.settings.reflectionReminderEnabled && this.settings.reflectionTime) {
      const todayStr = now.toISOString().split('T')[0];
      if (this.lastReflectionDate !== todayStr) {
        const [hours, minutes] = this.settings.reflectionTime.split(':').map(Number);
        const reflectionTime = new Date(now);
        reflectionTime.setHours(hours, minutes, 0, 0);

        // If it's reflection time or within 5 minutes after it
        if (now >= reflectionTime && (now.getTime() - reflectionTime.getTime()) < 5 * 60000) {
          this.lastReflectionDate = todayStr;
          this.showNotification('Take a moment to reflect on today.', 'reflection');
        }
      }
    }
  }

  private async showNotification(title: string, tag: string) {
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: tag
        });
      } else {
        new Notification(title);
      }
    }
  }

  private async syncOfflineNotifications() {
    if (!this.settings || !this.isPWA() || Notification.permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      // Check if showTrigger is supported
      if ('showTrigger' in Notification.prototype) {
        // Clear all existing scheduled notifications
        const notifications = await registration.getNotifications();
        for (const n of notifications) {
          n.close();
        }

        const now = new Date();

        // Schedule upcoming Activity Reminders
        if (this.settings.activityRemindersEnabled) {
          for (const task of this.tasks) {
             if (task.status === 'completed' || !task.dueTime) continue;
             const taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
             const offsetMs = this.settings.activityReminderOffset * 60000;
             const reminderTime = new Date(taskDate.getTime() - offsetMs);

             if (reminderTime > now) {
                registration.showNotification(`${task.title} starts in ${this.settings.activityReminderOffset} minutes.`, {
                  tag: task.id,
                  icon: '/pwa-192x192.png',
                  badge: '/pwa-192x192.png',
                  // @ts-ignore
                  showTrigger: new TimestampTrigger(reminderTime.getTime())
                });
             }
          }
        }

        // Schedule Reflection Reminder for today/tomorrow
        if (this.settings.reflectionReminderEnabled && this.settings.reflectionTime) {
           const [hours, minutes] = this.settings.reflectionTime.split(':').map(Number);
           const reflectionTime = new Date(now);
           reflectionTime.setHours(hours, minutes, 0, 0);
           
           if (reflectionTime < now) {
             reflectionTime.setDate(reflectionTime.getDate() + 1);
           }

           registration.showNotification('Take a moment to reflect on today.', {
             tag: 'reflection',
             icon: '/pwa-192x192.png',
             badge: '/pwa-192x192.png',
             // @ts-ignore
             showTrigger: new TimestampTrigger(reflectionTime.getTime())
           });
        }
      }
    } catch (err) {
      console.warn("Failed to sync offline notifications:", err);
    }
  }
}

export const reminderService = new ReminderService();
