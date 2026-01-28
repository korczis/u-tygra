/**
 * Performance monitoring and Core Web Vitals
 */

// Core Web Vitals measurement
function measureWebVitals() {
  // Largest Contentful Paint
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log('LCP candidate:', entry.startTime);
      // Send to analytics if configured
      if (window.gtag) {
        gtag('event', 'web_vital', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(entry.startTime)
        });
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS score:', clsValue);
        if (window.gtag) {
          gtag('event', 'web_vital', {
            event_category: 'performance',
            event_label: 'CLS',
            value: Math.round(clsValue * 1000)
          });
        }
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });

  // First Input Delay
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
      if (window.gtag) {
        gtag('event', 'web_vital', {
          event_category: 'performance',
          event_label: 'FID',
          value: Math.round(entry.processingStart - entry.startTime)
        });
      }
    }
  }).observe({ entryTypes: ['first-input'] });
}

// Error monitoring
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
  if (window.gtag) {
    gtag('event', 'exception', {
      description: event.error?.message || 'Unknown error',
      fatal: false
    });
  }
});

// Initialize performance monitoring
if (typeof PerformanceObserver !== 'undefined') {
  measureWebVitals();
}

// Resource loading monitoring
window.addEventListener('load', () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', navigation.loadEventEnd - navigation.fetchStart);

  if (window.gtag) {
    gtag('event', 'timing_complete', {
      name: 'page_load',
      value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
    });
  }
});