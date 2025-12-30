
import { createClient } from '@supabase/supabase-js';
import { Prediction, Task } from '../types';

// Accessing variables defined in vite.config.ts via process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const savePredictionToCloud = async (userId: string, prediction: Prediction) => {
  if (!supabase) {
    console.warn('Supabase not initialized. Check environment variables.');
    return null;
  }
  const { data, error } = await supabase
    .from('predictions')
    .upsert({ ...prediction, user_id: userId })
    .select();
  if (error) console.error('Supabase Error:', error);
  return data;
};

export const fetchUserVault = async (userId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  if (error) {
    console.error('Supabase Fetch Error:', error);
    return [];
  }
  return data as Prediction[];
};

export const syncTasks = async (predictionId: string, tasks: Task[]) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('tasks')
    .upsert(tasks.map(t => ({ ...t, prediction_id: predictionId })));
  if (error) console.error('Supabase Sync Error:', error);
};
