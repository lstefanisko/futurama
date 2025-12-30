import { createClient } from '@supabase/supabase-js';
import { Prediction, Task } from '../types';

// Tieto premenné musia byť nastavené v env (napr. vo Verceli)
const supabaseUrl = (process.env as any).VITE_SUPABASE_URL || '';
const supabaseKey = (process.env as any).VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

export const savePredictionToCloud = async (userId: string, prediction: Prediction) => {
  if (!supabase) return null;
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
  if (error) return [];
  return data as Prediction[];
};

export const syncTasks = async (predictionId: string, tasks: Task[]) => {
  if (!supabase) return;
  await supabase
    .from('tasks')
    .upsert(tasks.map(t => ({ ...t, prediction_id: predictionId })));
};