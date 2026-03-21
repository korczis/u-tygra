/**
 * Core Web Vitals 2026 Monitoring - Bravo Squad Optimization
 * Enhanced monitoring for LCP, INP, and CLS with performance budgets
 */

// Enable verbose logging only with ?debug=perf
const PERF_DEBUG = new URLSearchParams(window.location.search).has('debug');

// Performance budgets for Core Web Vitals 2026
const PERFORMANCE_BUDGETS = {
  LCP: 1800,  // 1.8s target
  INP: 150,   // 150ms target
  CLS: 0.05   // 0.05 target
};

class CoreWebVitalsMonitor {
  constructor() {
    this.lcpValue = 0;
    this.clsValue = 0;
    this.inpValue = 0;
    this.interactions = [];
    this.vitalsReported = false;
  }

  init() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }

    this.observeLCP();
    this.observeCLS();
    this.observeINP();
    this.observeLongTasks();
    this.setupPageVisibilityTracking();
  }

  observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.lcpValue = lastEntry.startTime;

      if (PERF_DEBUG) {
        console.log(`🎯 LCP: ${this.lcpValue.toFixed(2)}ms (Budget: ${PERFORMANCE_BUDGETS.LCP}ms)`);
        if (this.lcpValue > PERFORMANCE_BUDGETS.LCP) {
          console.warn(`⚠️ LCP Budget Exceeded: ${(this.lcpValue - PERFORMANCE_BUDGETS.LCP).toFixed(2)}ms over budget`);
        } else {
          console.log(`✅ LCP Within Budget: ${(PERFORMANCE_BUDGETS.LCP - this.lcpValue).toFixed(2)}ms under budget`);
        }
      }

      this.reportMetric('LCP', this.lcpValue, PERFORMANCE_BUDGETS.LCP);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeCLS() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          this.clsValue += entry.value;
        }
      }

      if (PERF_DEBUG) {
        console.log(`🎯 CLS: ${this.clsValue.toFixed(4)} (Budget: ${PERFORMANCE_BUDGETS.CLS})`);
        if (this.clsValue > PERFORMANCE_BUDGETS.CLS) {
          console.warn(`⚠️ CLS Budget Exceeded: ${(this.clsValue - PERFORMANCE_BUDGETS.CLS).toFixed(4)} over budget`);
        } else {
          console.log(`✅ CLS Within Budget: ${(PERFORMANCE_BUDGETS.CLS - this.clsValue).toFixed(4)} under budget`);
        }
      }

      this.reportMetric('CLS', this.clsValue, PERFORMANCE_BUDGETS.CLS);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  observeINP() {
    // Track all interactions for INP calculation
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.interactions.push({
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name,
          target: entry.target
        });

        // Calculate current INP (98th percentile of all interactions)
        this.updateINP();
      }
    }).observe({ entryTypes: ['event'], buffered: true });
  }

  updateINP() {
    if (this.interactions.length === 0) return;

    // Sort interactions by duration
    const sortedInteractions = [...this.interactions].sort((a, b) => a.duration - b.duration);

    // Calculate 98th percentile
    const percentileIndex = Math.max(0, Math.ceil(sortedInteractions.length * 0.98) - 1);
    this.inpValue = sortedInteractions[percentileIndex].duration;

    if (PERF_DEBUG) {
      console.log(`🎯 INP: ${this.inpValue.toFixed(2)}ms (Budget: ${PERFORMANCE_BUDGETS.INP}ms)`);
      if (this.inpValue > PERFORMANCE_BUDGETS.INP) {
        console.warn(`⚠️ INP Budget Exceeded: ${(this.inpValue - PERFORMANCE_BUDGETS.INP).toFixed(2)}ms over budget`);
        console.log('Slowest interactions:', sortedInteractions.slice(-5));
      } else {
        console.log(`✅ INP Within Budget: ${(PERFORMANCE_BUDGETS.INP - this.inpValue).toFixed(2)}ms under budget`);
      }
    }

    this.reportMetric('INP', this.inpValue, PERFORMANCE_BUDGETS.INP);
  }

  observeLongTasks() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (PERF_DEBUG) console.warn(`🐌 Long Task: ${entry.duration.toFixed(2)}ms at ${entry.startTime.toFixed(2)}ms`);

        if (window.gtag) {
          gtag('event', 'long_task', {
            event_category: 'performance',
            event_label: 'Main Thread Blocking',
            value: Math.round(entry.duration)
          });
        }
      }
    }).observe({ entryTypes: ['longtask'] });
  }

  setupPageVisibilityTracking() {
    // Report final metrics when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && !this.vitalsReported) {
        this.reportFinalVitals();
        this.vitalsReported = true;
      }
    });

    // Fallback: Report metrics after 30 seconds
    setTimeout(() => {
      if (!this.vitalsReported) {
        this.reportFinalVitals();
        this.vitalsReported = true;
      }
    }, 30000);
  }

  reportMetric(name, value, budget) {
    const budgetStatus = value <= budget ? 'pass' : 'fail';
    const overBudget = value > budget ? value - budget : 0;

    if (window.gtag) {
      gtag('event', 'core_web_vital', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        custom_parameter_1: budgetStatus,
        custom_parameter_2: Math.round(overBudget)
      });
    }
  }

  reportFinalVitals() {
    // Overall performance score
    const lcpPass = this.lcpValue <= PERFORMANCE_BUDGETS.LCP;
    const inpPass = this.inpValue <= PERFORMANCE_BUDGETS.INP;
    const clsPass = this.clsValue <= PERFORMANCE_BUDGETS.CLS;
    const overallScore = [lcpPass, inpPass, clsPass].filter(Boolean).length;

    if (PERF_DEBUG) {
      console.log('🏁 Final Core Web Vitals Report:');
      console.log(`   LCP: ${this.lcpValue.toFixed(2)}ms (Target: <${PERFORMANCE_BUDGETS.LCP}ms)`);
      console.log(`   INP: ${this.inpValue.toFixed(2)}ms (Target: <${PERFORMANCE_BUDGETS.INP}ms)`);
      console.log(`   CLS: ${this.clsValue.toFixed(4)} (Target: <${PERFORMANCE_BUDGETS.CLS})`);
      console.log(`📊 Overall Score: ${overallScore}/3 metrics passing budgets`);
    }

    if (window.gtag) {
      gtag('event', 'cwv_final_report', {
        event_category: 'performance',
        event_label: 'Core Web Vitals Score',
        value: overallScore,
        lcp_value: Math.round(this.lcpValue),
        inp_value: Math.round(this.inpValue),
        cls_value: Math.round(this.clsValue * 1000)
      });
    }
  }
}

// Additional performance monitoring
function monitorResourceLoading() {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');

    if (PERF_DEBUG) {
      console.log('📈 Page Performance Metrics:');
      console.log(`   Total Load Time: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      console.log(`   DOM Content Loaded: ${(navigation.domContentLoadedEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      var fp = paintEntries.find(function(e) { return e.name === 'first-paint'; });
      var fcp = paintEntries.find(function(e) { return e.name === 'first-contentful-paint'; });
      console.log('   First Paint: ' + (fp ? fp.startTime.toFixed(2) : 'N/A') + 'ms');
      console.log('   First Contentful Paint: ' + (fcp ? fcp.startTime.toFixed(2) : 'N/A') + 'ms');
    }

    if (window.gtag) {
      gtag('event', 'timing_complete', {
        name: 'page_load',
        value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      });
    }
  });
}

// Error monitoring
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
  if (window.gtag) {
    gtag('event', 'exception', {
      description: (event.error && event.error.message) || 'Unknown error',
      fatal: false
    });
  }
});

// Memory usage monitoring (if supported)
function monitorMemoryUsage() {
  if ('memory' in performance) {
    setInterval(() => {
      const memory = performance.memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100);

      if (usedPercent > 80) {
        if (PERF_DEBUG) console.warn(`⚠️ High Memory Usage: ${usedPercent.toFixed(1)}%`);

        if (window.gtag) {
          gtag('event', 'high_memory_usage', {
            event_category: 'performance',
            value: Math.round(usedPercent)
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }
}

// Initialize all monitoring
const cwvMonitor = new CoreWebVitalsMonitor();
cwvMonitor.init();
monitorResourceLoading();
monitorMemoryUsage();