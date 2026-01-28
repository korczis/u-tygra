/**
 * Charlie Squad Performance Monitoring
 * Self-monitoring system for analytics performance impact
 * Ensures Charlie Analytics doesn't degrade user experience
 */

class CharliePerformance {
  constructor() {
    this.metrics = {
      scriptLoadTime: 0,
      initTime: 0,
      trackingLatency: [],
      memoryUsage: [],
      eventQueueSize: 0,
      errorCount: 0,
      performanceImpact: 'minimal'
    };

    this.thresholds = {
      maxLatency: 50, // ms
      maxMemoryUsage: 10, // MB
      maxQueueSize: 100,
      maxErrors: 5
    };

    this.startTime = performance.now();
    this.observing = false;

    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    // Monitor script loading performance
    this.monitorScriptLoading();

    // Set up performance observers
    this.setupPerformanceObservers();

    // Monitor memory usage periodically
    this.startMemoryMonitoring();

    // Monitor network impact
    this.monitorNetworkImpact();

    // Report performance metrics periodically
    this.startPerformanceReporting();

    console.log('📊 Charlie Performance monitoring initialized');
  }

  /**
   * Monitor script loading performance
   */
  monitorScriptLoading() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      this.metrics.pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
    }

    // Monitor resource loading
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
      if (resource.name.includes('charlie') || resource.name.includes('analytics')) {
        this.metrics.scriptLoadTime += resource.duration;
      }
    });
  }

  /**
   * Setup performance observers
   */
  setupPerformanceObservers() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Monitor long tasks that might be caused by analytics
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.recordPerformanceImpact('long_task', entry.duration);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Monitor layout shifts that might be caused by analytics UI
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) {
            this.recordPerformanceImpact('layout_shift', entry.value);
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      this.observing = true;
    } catch (e) {
      console.warn('Performance observers not available:', e);
    }
  }

  /**
   * Start memory usage monitoring
   */
  startMemoryMonitoring() {
    if (!('memory' in performance)) return;

    const monitorMemory = () => {
      try {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;

        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          used: usedMB,
          limit: memory.jsHeapSizeLimit / 1024 / 1024
        });

        // Keep only last 20 measurements
        if (this.metrics.memoryUsage.length > 20) {
          this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-20);
        }

        // Check for memory leaks
        if (usedMB > this.thresholds.maxMemoryUsage && this.metrics.memoryUsage.length > 5) {
          const trend = this.calculateMemoryTrend();
          if (trend > 1) { // Memory consistently increasing
            this.recordPerformanceImpact('memory_leak', usedMB);
          }
        }
      } catch (e) {
        this.metrics.errorCount++;
      }
    };

    // Monitor every 30 seconds
    setInterval(monitorMemory, 30000);
    monitorMemory(); // Initial measurement
  }

  /**
   * Calculate memory usage trend
   */
  calculateMemoryTrend() {
    if (this.metrics.memoryUsage.length < 3) return 0;

    const recent = this.metrics.memoryUsage.slice(-3);
    const slopes = [];

    for (let i = 1; i < recent.length; i++) {
      const slope = (recent[i].used - recent[i-1].used) /
                   (recent[i].timestamp - recent[i-1].timestamp);
      slopes.push(slope);
    }

    return slopes.reduce((a, b) => a + b, 0) / slopes.length;
  }

  /**
   * Monitor network impact of analytics requests
   */
  monitorNetworkImpact() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Check for analytics-related requests
          if (entry.name.includes('google') ||
              entry.name.includes('analytics') ||
              entry.name.includes('gtag')) {

            this.recordNetworkRequest(entry);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observer not available:', e);
    }
  }

  /**
   * Record network request for analytics
   */
  recordNetworkRequest(entry) {
    const requestData = {
      url: entry.name.substring(entry.name.lastIndexOf('/') + 1),
      duration: entry.duration,
      size: entry.transferSize || 0,
      timestamp: Date.now()
    };

    this.metrics.networkRequests = this.metrics.networkRequests || [];
    this.metrics.networkRequests.push(requestData);

    // Keep only last 50 requests
    if (this.metrics.networkRequests.length > 50) {
      this.metrics.networkRequests = this.metrics.networkRequests.slice(-50);
    }

    // Check for excessive network usage
    if (entry.duration > 1000) { // Request took > 1s
      this.recordPerformanceImpact('slow_network', entry.duration);
    }
  }

  /**
   * Monitor Charlie Analytics event queue performance
   */
  monitorEventQueue() {
    if (!window.charlie) return;

    const queueSize = window.charlie.sessionData?.userBehavior?.length || 0;
    this.metrics.eventQueueSize = queueSize;

    if (queueSize > this.thresholds.maxQueueSize) {
      this.recordPerformanceImpact('large_queue', queueSize);
    }
  }

  /**
   * Record tracking latency
   */
  recordTrackingLatency(startTime) {
    const latency = performance.now() - startTime;
    this.metrics.trackingLatency.push(latency);

    // Keep only last 100 measurements
    if (this.metrics.trackingLatency.length > 100) {
      this.metrics.trackingLatency = this.metrics.trackingLatency.slice(-100);
    }

    if (latency > this.thresholds.maxLatency) {
      this.recordPerformanceImpact('high_latency', latency);
    }
  }

  /**
   * Record performance impact
   */
  recordPerformanceImpact(type, value) {
    this.metrics.impacts = this.metrics.impacts || [];
    this.metrics.impacts.push({
      type,
      value,
      timestamp: Date.now()
    });

    // Update overall performance impact assessment
    this.assessPerformanceImpact();

    console.warn(`⚠️ Charlie Analytics performance impact: ${type} = ${value}`);
  }

  /**
   * Assess overall performance impact
   */
  assessPerformanceImpact() {
    const impacts = this.metrics.impacts || [];
    const recentImpacts = impacts.filter(i => Date.now() - i.timestamp < 300000); // Last 5 minutes

    if (recentImpacts.length === 0) {
      this.metrics.performanceImpact = 'minimal';
    } else if (recentImpacts.length < 3) {
      this.metrics.performanceImpact = 'low';
    } else if (recentImpacts.length < 6) {
      this.metrics.performanceImpact = 'moderate';
    } else {
      this.metrics.performanceImpact = 'high';
      this.triggerPerformanceAlert();
    }
  }

  /**
   * Trigger performance alert
   */
  triggerPerformanceAlert() {
    console.error('🚨 Charlie Analytics high performance impact detected!');

    // Optionally throttle or disable analytics temporarily
    if (window.charlie) {
      console.log('🔧 Temporarily reducing Charlie Analytics activity');
      // Could implement throttling here
    }

    // Report to dashboard if available
    if (window.charlieDashboard) {
      // Dashboard could show performance warnings
    }
  }

  /**
   * Start periodic performance reporting
   */
  startPerformanceReporting() {
    const reportMetrics = () => {
      this.monitorEventQueue();

      const summary = this.generatePerformanceSummary();

      // Log summary periodically (every 5 minutes)
      if (summary.runtime > 300000) {
        console.log('📊 Charlie Performance Summary:', summary);
      }
    };

    setInterval(reportMetrics, 60000); // Every minute
  }

  /**
   * Generate performance summary
   */
  generatePerformanceSummary() {
    const avgLatency = this.metrics.trackingLatency.length > 0
      ? this.metrics.trackingLatency.reduce((a, b) => a + b, 0) / this.metrics.trackingLatency.length
      : 0;

    const recentMemory = this.metrics.memoryUsage.slice(-1)[0];
    const currentMemoryMB = recentMemory ? recentMemory.used : 0;

    return {
      runtime: performance.now() - this.startTime,
      performanceImpact: this.metrics.performanceImpact,
      avgTrackingLatency: Math.round(avgLatency * 100) / 100,
      currentMemoryMB: Math.round(currentMemoryMB * 100) / 100,
      eventQueueSize: this.metrics.eventQueueSize,
      errorCount: this.metrics.errorCount,
      networkRequests: (this.metrics.networkRequests || []).length,
      recentImpacts: (this.metrics.impacts || []).filter(
        i => Date.now() - i.timestamp < 300000
      ).length,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.trackingLatency.some(l => l > this.thresholds.maxLatency)) {
      recommendations.push('Consider reducing tracking frequency');
    }

    if (this.metrics.eventQueueSize > this.thresholds.maxQueueSize) {
      recommendations.push('Implement event queue size limits');
    }

    const memoryTrend = this.calculateMemoryTrend();
    if (memoryTrend > 0.1) {
      recommendations.push('Monitor for potential memory leaks');
    }

    if (this.metrics.errorCount > this.thresholds.maxErrors) {
      recommendations.push('Address recurring analytics errors');
    }

    return recommendations;
  }

  /**
   * Measure and track a function's performance
   */
  measureFunction(name, fn) {
    const startTime = performance.now();

    try {
      const result = fn();

      if (result && typeof result.then === 'function') {
        // Handle async function
        return result.finally(() => {
          this.recordTrackingLatency(startTime);
        });
      } else {
        // Handle sync function
        this.recordTrackingLatency(startTime);
        return result;
      }
    } catch (error) {
      this.metrics.errorCount++;
      this.recordTrackingLatency(startTime);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.generatePerformanceSummary()
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      scriptLoadTime: 0,
      initTime: 0,
      trackingLatency: [],
      memoryUsage: [],
      eventQueueSize: 0,
      errorCount: 0,
      performanceImpact: 'minimal'
    };
    this.startTime = performance.now();
    console.log('🔄 Charlie Performance metrics reset');
  }
}

// Initialize performance monitoring
const charliePerformance = new CharliePerformance();

// Global access
window.charliePerformance = charliePerformance;

// Extend Charlie Analytics with performance monitoring
if (window.charlie) {
  // Wrap original tracking methods with performance monitoring
  const originalTrackBeerView = window.charlie.trackBeerView;
  window.charlie.trackBeerView = function(beer) {
    return charliePerformance.measureFunction('trackBeerView', () => {
      return originalTrackBeerView.call(this, beer);
    });
  };

  const originalTrackBreweryClick = window.charlie.trackBreweryClick;
  window.charlie.trackBreweryClick = function(brewery, url) {
    return charliePerformance.measureFunction('trackBreweryClick', () => {
      return originalTrackBreweryClick.call(this, brewery, url);
    });
  };

  const originalRecordBehavior = window.charlie.recordBehavior;
  window.charlie.recordBehavior = function(type, data) {
    return charliePerformance.measureFunction('recordBehavior', () => {
      return originalRecordBehavior.call(this, type, data);
    });
  };
}

// Development helpers
window.charliePerformanceReport = () => charliePerformance.generatePerformanceSummary();
window.resetCharliePerformance = () => charliePerformance.resetMetrics();

console.log('📊 Charlie Performance monitoring active - tracking analytics performance impact');