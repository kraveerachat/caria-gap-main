import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gapSeverityColor(gap: number): string {
  if (gap >= 30) return 'text-danger';
  if (gap >= 15) return 'text-warning';
  return 'text-success';
}

export function gapSeverityBg(gap: number): string {
  if (gap >= 30) return 'bg-red-500';
  if (gap >= 15) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function formatScore(value: number): string {
  return Math.round(value).toString();
}

// Inline SVG icons — same shape as the lucide-react equivalents (CircleAlert / CircleCheck / Info),
// kept as raw strings because this helper uses innerHTML rather than JSX.
const TOAST_ICONS = {
  error:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  success:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  info:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
} as const;

export function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  if (typeof window === 'undefined') return;
  const toast = document.createElement('div');
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.className = `fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-xl ${
    type === 'error'
      ? 'bg-red-600/95 border-red-400/20'
      : type === 'success'
        ? 'bg-emerald-600/95 border-emerald-400/20'
        : 'bg-slate-900/95 border-white/10 dark:bg-slate-800/95'
  }`;

  // Sanitize the message — innerHTML is used for the icon, so the user-provided
  // string must not be allowed to inject markup.
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  toast.innerHTML = `${TOAST_ICONS[type]}<span>${safeMessage}</span>`;
  
  // Custom initial slide-in animation styles
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(15px)';
  toast.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  
  document.body.appendChild(toast);
  
  // Trigger entry animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
