import { Task, Goal, AppSettings } from '../types';

// ─── IndexedDB async wrapper ─────────────────────────────────────────────────

const DB_NAME = 'clearday-reminders';
const STORE_NAME = 'reminders';
const DB_VERSION = 1;

interface StoredReminder {
  id: string;
  title: string;
  body: string;
  fireAt: number;
  sound: string;
  vibrate: boolean;
  taskId?: string;
  goalId?: string;
  status: 'pending' | 'fired' | 'missed';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(reminder: StoredReminder): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(reminder);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(id: string): Promise<StoredReminder | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as StoredReminder | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(): Promise<StoredReminder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as StoredReminder[]);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Web Audio ───────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// ─── ReminderService ─────────────────────────────────────────────────────────

class ReminderService {
  private foregroundTimer: ReturnType<typeof setInterval> | null = null;
  private currentSettings: AppSettings | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private visibilityBound = false;

  // ── Layer 1 + 2 + 3 init ─────────────────────────────────────────────────

  init(tasks: Task[], goals: Goal[], settings: AppSettings): void {
    this.currentSettings = settings;

    // Layer 1: foreground interval
    if (!this.foregroundTimer) {
      this.foregroundTimer = setInterval(() => this.foregroundCheck(), 60_000);
      this.foregroundCheck();
    }

    // Layer 3: visibilitychange recovery
    if (!this.visibilityBound) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.visibilityBound = true;
    }

    // BroadcastChannel so SW can ask page to play sound
    if (!this.broadcastChannel && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('clearday-reminders');
      this.broadcastChannel.onmessage = (ev) => {
        if (ev.data?.type === 'PLAY_SOUND') {
          this.playSound((ev.data.sound ?? settings.sound) as AppSettings['sound']);
        }
      };
    }

    // Schedule from current data, then push to SW
    this.syncFromData(tasks, goals, settings);
  }

  private async syncFromData(tasks: Task[], goals: Goal[], settings: AppSettings): Promise<void> {
    if (Notification.permission !== 'granted') return;

    if (settings.activityRemindersEnabled) {
      for (const task of tasks) {
        if (task.status === 'completed' || !task.dueDate || !task.dueTime) continue;
        await this.scheduleTaskReminder(task, settings.activityReminderOffset);
      }
    }

    if (settings.goalRemindersEnabled) {
      for (const goal of goals) {
        await this.scheduleGoalReminder(goal, settings.goalReminderDaysBefore ?? 3);
      }
    }

    // Handle reflection reminder
    if (settings.reflectionReminderEnabled && settings.reflectionTime) {
      const [hh, mm] = settings.reflectionTime.split(':').map(Number);
      const fireDate = new Date();
      fireDate.setHours(hh, mm, 0, 0);
      if (fireDate.getTime() <= Date.now()) {
        fireDate.setDate(fireDate.getDate() + 1);
      }
      const r: StoredReminder = {
        id: 'reflection',
        title: '🧘 Reflection Time',
        body: 'Take a moment to reflect on today.',
        fireAt: fireDate.getTime(),
        sound: settings.sound,
        vibrate: settings.vibration !== 'none',
        status: 'pending',
      };
      const existing = await dbGet('reflection');
      if (!existing || existing.status !== 'pending') {
        await dbPut(r);
      }
    }

    await this.postPendingToSW();
  }

  // ── Layer 1: foreground polling ───────────────────────────────────────────

  private foregroundCheck = async (): Promise<void> => {
    const now = Date.now();
    const all = await dbGetAll();
    for (const r of all) {
      if (r.status === 'pending' && r.fireAt <= now) {
        await this.fireReminder(r, false);
      }
    }
  };

  // ── Layer 3: visibility recovery ─────────────────────────────────────────

  private onVisibilityChange = async (): Promise<void> => {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    const all = await dbGetAll();
    for (const r of all) {
      if (r.status === 'pending' && r.fireAt <= now) {
        await this.fireReminder(r, true);
      }
    }
    await this.postPendingToSW();
  };

  // ── DND Helper ─────────────────────────────────────────────────────────

  private isDndActive(): boolean {
    if (!this.currentSettings?.dndEnabled) return false;
    const { dndFrom, dndTo } = this.currentSettings;
    if (!dndFrom || !dndTo) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [fromH, fromM] = dndFrom.split(':').map(Number);
    const [toH, toM] = dndTo.split(':').map(Number);
    const startMins = fromH * 60 + fromM;
    const endMins = toH * 60 + toM;

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins < endMins;
    } else {
      // Overnight range, e.g. 22:00 to 07:00
      return currentMins >= startMins || currentMins < endMins;
    }
  }

  // ── Fire reminder ─────────────────────────────────────────────────────────

  private async fireReminder(r: StoredReminder, missed: boolean): Promise<void> {
    const isDnd = this.isDndActive();
    const body = missed ? `Missed: ${r.body}` : r.body;
    await this.showNotification(r.title, body, r, isDnd);
    if (!isDnd) {
      this.playSound(r.sound as AppSettings['sound']);
    }
    await dbPut({ ...r, status: missed ? 'missed' : 'fired' });
  }

  private async showNotification(title: string, body: string, r: StoredReminder, isDnd: boolean = false): Promise<void> {
    if (Notification.permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) {
      new Notification(title, { body });
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: r.id,
      vibrate: !isDnd && r.vibrate ? [200, 100, 200] : undefined,
      silent: isDnd,
      actions: [
        { action: 'done', title: '✅ Done' },
        { action: 'snooze', title: '⏰ Snooze 10m' }
      ],
      data: { taskId: r.taskId, goalId: r.goalId }
    } as NotificationOptions);
  }

  // ── Layer 2: post to SW ───────────────────────────────────────────────────

  private async postPendingToSW(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const all = await dbGetAll();
      const pending = all.filter(r => r.status === 'pending');
      if (reg.active && pending.length > 0) {
        reg.active.postMessage({ type: 'SCHEDULE_REMINDER', reminders: pending });
      }
    } catch (e) {
      console.warn('[reminderService] postPendingToSW error:', e);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async scheduleTaskReminder(task: Task, offsetMinutes: number): Promise<void> {
    if (!task.dueDate || !task.dueTime) return;
    const id = `task-${task.id}`;
    const fireAt = new Date(`${task.dueDate}T${task.dueTime}`).getTime() - offsetMinutes * 60_000;
    if (isNaN(fireAt) || fireAt <= Date.now()) return;

    const existing = await dbGet(id);
    if (existing && existing.status === 'pending' && existing.fireAt === fireAt) return;

    const reminder: StoredReminder = {
      id,
      title: `⏰ ${task.title}`,
      body: `Starts in ${offsetMinutes} minutes`,
      fireAt,
      sound: this.currentSettings?.sound ?? 'default',
      vibrate: this.currentSettings?.vibration !== 'none',
      taskId: task.id,
      status: 'pending',
    };
    await dbPut(reminder);
  }

  async scheduleGoalReminder(goal: Goal, offsetDays: number): Promise<void> {
    const id = `goal-${goal.id}`;
    const existing = await dbGet(id);
    if (existing && existing.status === 'pending') return;

    const fireDate = new Date();
    fireDate.setDate(fireDate.getDate() + offsetDays);
    fireDate.setHours(9, 0, 0, 0);
    const fireAt = fireDate.getTime();
    if (fireAt <= Date.now()) return;

    const reminder: StoredReminder = {
      id,
      title: `🎯 Goal Reminder`,
      body: `Don't forget your goal: ${goal.title}`,
      fireAt,
      sound: this.currentSettings?.sound ?? 'default',
      vibrate: this.currentSettings?.vibration !== 'none',
      goalId: goal.id,
      status: 'pending',
    };
    await dbPut(reminder);
  }

  async cancelReminder(id: string): Promise<void> {
    await dbDelete(id);
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({ type: 'CANCEL_REMINDER', id });
      } catch (_) {}
    }
  }

  async snoozeReminder(id: string, delayMs: number): Promise<void> {
    const existing = await dbGet(id);
    if (!existing) return;
    const updated: StoredReminder = {
      ...existing,
      fireAt: Date.now() + delayMs,
      status: 'pending',
    };
    await dbPut(updated);
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', reminders: [updated] });
      } catch (_) {}
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  playSound(sound: AppSettings['sound']): void {
    if (sound === 'none') return;
    try {
      const ctx = getAudioContext();
      if (sound === 'alarm') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } else {
        // 'default' | 'chime' → C5 → E5
        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.4, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        playTone(523, ctx.currentTime, 0.6);        // C5
        playTone(659, ctx.currentTime + 0.6, 0.6);  // E5
      }
    } catch (e) {
      console.warn('[reminderService] playSound error:', e);
    }
  }

  isPWA(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }
}

export const reminderService = new ReminderService();
