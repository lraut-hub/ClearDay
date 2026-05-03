
export type TaskStatus = 'pending' | 'completed' | 'rescheduled';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  goalId?: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (Start Time)
  endTime?: string; // HH:mm (End Time)
  status: TaskStatus;
  reminderTime?: string; // HH:mm
  priority?: TaskPriority;
}

export interface Goal {
    id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    tasks: Omit<Task, 'id' | 'status'>[];
}

export enum Page {
  Home = 'HOME',
  Schedule = 'SCHEDULE',
  Planner = 'PLANNER',
  Goals = 'GOALS',
  AddGoal = 'ADD_GOAL',
  Settings = 'SETTINGS',
  Progress = 'PROGRESS',
  ImageAnalysis = 'IMAGE_ANALYSIS',
}

// Notification Settings
export type NotificationSound = 'default' | 'chime' | 'alarm' | 'none';
export type VibrationPattern = 'default' | 'short' | 'long' | 'none';

export interface AppSettings {
  sound: NotificationSound;
  vibration: VibrationPattern;
}