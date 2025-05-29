// Suppress benign ResizeObserver errors
// This is a known issue that doesn't affect functionality

// Suppress console errors
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
     args[0].includes('ResizeObserver loop'))
  ) {
    // Suppress this specific benign error
    return;
  }
  originalError.apply(console, args);
};

// Handle uncaught errors
window.addEventListener('error', (event) => {
  if (event.message && 
      (event.message.includes('ResizeObserver loop') || 
       event.message.includes('ResizeObserver loop completed with undelivered notifications'))) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections that might contain ResizeObserver errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && 
      typeof event.reason === 'string' &&
      event.reason.includes('ResizeObserver loop')) {
    event.preventDefault();
    return false;
  }
});

// More aggressive suppression - override the global error handler
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
    return true; // Suppress the error
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

// Also try to suppress at the React error boundary level
const originalReactError = window.console.error;
if (typeof originalReactError === 'function') {
  window.console.error = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string') {
      if (args[0].includes('ResizeObserver loop')) {
        return; // Suppress ResizeObserver errors
      }
    }
    return originalReactError.apply(this, args);
  };
}

export default {};
