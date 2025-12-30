/**
 * Centralized style constants to avoid duplication across components
 */

// Common Glass Panel Styles
export const GLASS_PANEL_BASE = "glass-panel rounded-xl border border-white/5";
export const GLASS_PANEL_HOVER = "hover:border-cyan-500/30 transition-all";
export const GLASS_PANEL_INTERACTIVE = `${GLASS_PANEL_BASE} ${GLASS_PANEL_HOVER}`;

// Typography Styles
export const ORBITRON_HEADING = "font-orbitron font-black";
export const ORBITRON_LABEL = "font-orbitron font-black uppercase";
export const ORBITRON_LABEL_SM = "text-[10px] font-orbitron font-black uppercase tracking-widest";
export const ORBITRON_LABEL_MD = "text-[12px] font-orbitron font-black uppercase tracking-[0.5em]";

// Button Styles
export const BUTTON_PRIMARY = "px-6 py-2 bg-cyan-500 text-black font-orbitron font-black text-[10px] rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]";
export const BUTTON_SECONDARY = "px-4 py-2 border border-white/10 text-white hover:bg-white/5 transition-all";
export const BUTTON_DANGER = "px-4 py-2 text-[9px] font-orbitron border border-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all";

// Input Styles
export const INPUT_BASE = "w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all";
export const INPUT_SMALL = "bg-white/[0.02] border border-white/10 rounded-xl px-6 py-4 text-sm text-zinc-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all";

// Loading Spinner
export const SPINNER_BASE = "border-2 border-cyan-500 border-t-transparent rounded-full animate-spin";
export const SPINNER_SM = `w-12 h-12 ${SPINNER_BASE}`;
export const SPINNER_MD = `w-16 h-16 ${SPINNER_BASE}`;
export const SPINNER_LG = `w-20 h-20 ${SPINNER_BASE}`;

// Common Color Classes
export const TEXT_CYAN_GLOW = "text-cyan-400 text-glow";
export const TEXT_MUTED = "text-zinc-500";
export const TEXT_LABEL = "text-zinc-600";
