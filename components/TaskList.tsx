
import React, { useState, useEffect } from 'react';
import { Task, Language } from '../types';
import { translations } from '../translations';
import { ORBITRON_LABEL_MD } from '../utils/styleConstants';

interface TaskListProps {
  predictionId: string;
  lang: Language;
}

const TaskList: React.FC<TaskListProps> = ({ predictionId, lang }) => {
  const t = translations[lang];
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Load tasks for this specific prediction scenario
  useEffect(() => {
    const saved = localStorage.getItem(`tasks_${predictionId}`);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks([]);
    }
  }, [predictionId]);

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem(`tasks_${predictionId}`, JSON.stringify(tasks));
  }, [tasks, predictionId]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={`${ORBITRON_LABEL_MD} text-cyan-400 flex items-center gap-3`}>
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          {t.tasksTitle}
        </h4>
        <span className="text-[10px] font-mono text-zinc-600">
          LOG_ID: {predictionId.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <form onSubmit={addTask} className="relative group">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder={t.addTaskPlaceholder}
          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black disabled:opacity-30 disabled:hover:bg-cyan-500/10 disabled:hover:text-cyan-400 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="py-10 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t.noTasks}</span>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                task.completed 
                  ? 'bg-cyan-500/5 border-cyan-500/20 opacity-60' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  task.completed 
                    ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]' 
                    : 'border-white/10 hover:border-cyan-500/50'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <span className={`flex-1 text-sm transition-all ${
                task.completed ? 'text-cyan-400 line-through' : 'text-zinc-300'
              }`}>
                {task.text}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
