// Suppress ResizeObserver loop errors that are benign but annoying
// This script loads before React to catch errors early

(function() {
  'use strict';

  // Store original error handlers
  const originalConsoleError = console.error;
  const originalWindowOnError = window.onerror;

  // Override console.error
  console.error = function(...args) {
    // Check if this is a ResizeObserver error
    if (args.length > 0 && typeof args[0] === 'string') {
      if (args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
          args[0].includes('ResizeObserver loop')) {
        // Suppress this specific error
        return;
      }
    }
    // Call original console.error for other errors
    return originalConsoleError.apply(console, args);
  };

  // Override window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
      return true; // Suppress the error
    }
    if (originalWindowOnError) {
      return originalWindowOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle error events
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('ResizeObserver loop')) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true);

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && typeof event.reason === 'string' && 
        event.reason.includes('ResizeObserver loop')) {
      event.preventDefault();
      return false;
    }
  });

})();
