
import { supabase } from './supabaseClient';
import { Task, Goal } from '../types';

export const syncService = {
  async saveTasks(userId: string, tasks: Task[]) {
    if (!userId) return;
    
    // We'll upsert all tasks for this user
    // In a real app, you might want to only sync changed items
    const tasksToSync = tasks.map(task => ({
      ...task,
      user_id: userId,
      // Ensure specific fields match DB column names if needed
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(tasksToSync, { onConflict: 'id' });

    if (error) console.error('Error syncing tasks:', error);
  },

  async saveGoals(userId: string, goals: Goal[]) {
    if (!userId) return;

    const goalsToSync = goals.map(goal => ({
      ...goal,
      user_id: userId,
    }));

    const { error } = await supabase
      .from('goals')
      .upsert(goalsToSync, { onConflict: 'id' });

    if (error) console.error('Error syncing goals:', error);
  },

  async fetchUserData(userId: string) {
    if (!userId) return { tasks: [], goals: [] };

    const [tasksRes, goalsRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId)
    ]);

    return {
      tasks: (tasksRes.data as Task[]) || [],
      goals: (goalsRes.data as Goal[]) || []
    };
  }
};
