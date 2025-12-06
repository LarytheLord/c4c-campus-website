/**
 * Toast Utility - Vanilla JS implementation for Astro pages
 * Creates branded, accessible toast notifications without React
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  duration?: number;
}

const toastStyles: Record<ToastType, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  success: {
    bg: 'background: #ecfdf5;',
    border: 'border: 1px solid #a7f3d0;',
    iconBg: 'background: #d1fae5;',
    iconColor: 'color: #059669;',
  },
  error: {
    bg: 'background: #fef2f2;',
    border: 'border: 1px solid #fecaca;',
    iconBg: 'background: #fee2e2;',
    iconColor: 'color: #dc2626;',
  },
  warning: {
    bg: 'background: #fffbeb;',
    border: 'border: 1px solid #fde68a;',
    iconBg: 'background: #fef3c7;',
    iconColor: 'color: #d97706;',
  },
  info: {
    bg: 'background: #ecfeff;',
    border: 'border: 1px solid #a5f3fc;',
    iconBg: 'background: #cffafe;',
    iconColor: 'color: #0891b2;',
  },
};

const icons: Record<ToastType, string> = {
  success: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
  </svg>`,
  error: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>`,
  warning: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>`,
  info: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
};

let containerId = 'c4c-toast-container';

function ensureContainer(): HTMLElement {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

function createToast(type: ToastType, message: string, options: ToastOptions = {}): HTMLElement {
  const style = toastStyles[type];
  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  toast.style.cssText = `
    ${style.bg}
    ${style.border}
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 24rem;
    width: 100%;
    pointer-events: auto;
    animation: slideInRight 300ms ease-out;
    transform-origin: right center;
  `;

  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = `
    ${style.iconBg}
    ${style.iconColor}
    padding: 0.375rem;
    border-radius: 9999px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  iconWrapper.innerHTML = icons[type];

  const content = document.createElement('div');
  content.style.cssText = 'flex: 1; min-width: 0;';

  if (options.title) {
    const title = document.createElement('p');
    title.style.cssText = 'font-weight: 600; color: #111827; font-size: 0.875rem; margin: 0 0 0.25rem 0;';
    title.textContent = options.title;
    content.appendChild(title);
  }

  const messageEl = document.createElement('p');
  messageEl.style.cssText = 'color: #374151; font-size: 0.875rem; margin: 0;';
  messageEl.textContent = message;
  content.appendChild(messageEl);

  const closeButton = document.createElement('button');
  closeButton.setAttribute('aria-label', 'Dismiss notification');
  closeButton.style.cssText = `
    flex-shrink: 0;
    color: #9ca3af;
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    transition: color 150ms;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>`;
  closeButton.onmouseover = () => closeButton.style.color = '#4b5563';
  closeButton.onmouseout = () => closeButton.style.color = '#9ca3af';
  closeButton.onclick = () => dismissToast(toast);

  toast.appendChild(iconWrapper);
  toast.appendChild(content);
  toast.appendChild(closeButton);

  return toast;
}

function dismissToast(toast: HTMLElement): void {
  toast.style.animation = 'fadeOut 200ms ease-out forwards';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  setTimeout(() => {
    toast.remove();
    // Clean up container if empty
    const container = document.getElementById(containerId);
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 200);
}

function showToast(type: ToastType, message: string, options: ToastOptions = {}): void {
  const container = ensureContainer();
  const toast = createToast(type, message, options);
  container.appendChild(toast);

  const duration = options.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        dismissToast(toast);
      }
    }, duration);
  }
}

// Public API
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast('success', message, options),
  error: (message: string, options?: ToastOptions) => showToast('error', message, options),
  warning: (message: string, options?: ToastOptions) => showToast('warning', message, options),
  info: (message: string, options?: ToastOptions) => showToast('info', message, options),
};

// Add to window for use in inline scripts
if (typeof window !== 'undefined') {
  (window as any).toast = toast;
}

export default toast;
