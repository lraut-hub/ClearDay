// sw-reminders.js
// This file is imported by the generated service worker via workbox
// It handles reminder scheduling and notification actions

const REMINDER_CHANNEL = 'clearday-reminders';

// Listen for messages from the app to schedule reminders
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const reminders = event.data.reminders || [];
    scheduleReminders(reminders);
  }
  if (event.data?.type === 'CANCEL_REMINDER') {
    // Clear existing timers for this id (best effort)
    cancelledIds.add(event.data.id);
    const timerId = scheduledTimers.get(event.data.id);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      scheduledTimers.delete(event.data.id);
    }
  }
});

const cancelledIds = new Set();
const scheduledTimers = new Map(); // id -> timeoutId

function scheduleReminders(reminders) {
  const now = Date.now();
  for (const reminder of reminders) {
    if (cancelledIds.has(reminder.id)) continue;
    if (scheduledTimers.has(reminder.id)) continue; // already scheduled
    const delay = Math.max(0, reminder.fireAt - now);
    const timerId = setTimeout(() => {
      if (!cancelledIds.has(reminder.id)) {
        fireReminder(reminder);
      }
      scheduledTimers.delete(reminder.id);
    }, delay);
    scheduledTimers.set(reminder.id, timerId);
  }
}

function fireReminder(reminder) {
  // Notify any open app tabs to play sound
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    if (clients.length > 0) {
      clients.forEach(client => client.postMessage({ type: 'PLAY_SOUND', sound: reminder.sound }));
    }
  });

  // Show OS notification (works offline)
  self.registration.showNotification(reminder.title, {
    body: reminder.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: reminder.id,
    vibrate: reminder.vibrate ? [200, 100, 200] : undefined,
    actions: [
      { action: 'done', title: '✅ Done' },
      { action: 'snooze', title: '⏰ Snooze 10m' }
    ],
    data: { taskId: reminder.taskId, goalId: reminder.goalId, reminderId: reminder.id }
  });
}

// Handle notification click actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { action } = event;
  const { taskId, goalId, reminderId } = event.notification.data || {};

  if (action === 'done') {
    // Tell all open clients to mark task done
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'MARK_DONE', taskId, goalId }));
        if (clients.length === 0) {
          return self.clients.openWindow('/');
        }
      })
    );
  } else if (action === 'snooze') {
    // Tell all open clients to snooze this reminder
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SNOOZE_REMINDER', reminderId, snoozeMs: 10 * 60 * 1000 }));
        if (clients.length === 0) {
          return self.clients.openWindow('/');
        }
      })
    );
  } else {
    // Default: open/focus app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        for (const client of clients) {
          if (client.url === '/' && 'focus' in client) return client.focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});
