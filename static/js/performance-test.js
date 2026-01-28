/**
 * Performance Testing Suite for Core Web Vitals 2026
 * Automated validation of optimization targets
 */

class PerformanceTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFn, expectedValue, operator = '<=') {
    this.tests.push({
      name,
      testFn,
      expectedValue,
      operator
    });
  }

  async runAllTests() {
    console.log('🧪 Running Core Web Vitals Performance Tests...\n');

    for (const test of this.tests) {
      await this.runTest(test);
    }

    this.printSummary();
    return this.results;
  }

  async runTest(test) {
    try {
      const startTime = performance.now();
      const actualValue = await test.testFn();
      const duration = performance.now() - startTime;

      const passed = this.evaluateResult(actualValue, test.expectedValue, test.operator);

      const result = {
        name: test.name,
        passed,
        actualValue,
        expectedValue: test.expectedValue,
        operator: test.operator,
        duration
      };

      this.results.push(result);

      const status = passed ? '✅ PASS' : '❌ FAIL';
      const comparison = `${actualValue} ${test.operator} ${test.expectedValue}`;

      console.log(`${status} ${test.name}`);
      console.log(`     Expected: ${comparison}`);
      console.log(`     Duration: ${duration.toFixed(2)}ms\n`);

    } catch (error) {
      console.error(`💥 ERROR in test "${test.name}":`, error);
      this.results.push({
        name: test.name,
        passed: false,
        error: error.message
      });
    }
  }

  evaluateResult(actual, expected, operator) {
    switch (operator) {
      case '<=': return actual <= expected;
      case '<': return actual < expected;
      case '>=': return actual >= expected;
      case '>': return actual > expected;
      case '===': return actual === expected;
      case '!==': return actual !== expected;
      default: return false;
    }
  }

  printSummary() {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const passRate = (passedTests / totalTests * 100).toFixed(1);

    console.log('📊 Performance Test Summary:');
    console.log(`   Tests Passed: ${passedTests}/${totalTests} (${passRate}%)`);

    if (passedTests === totalTests) {
      console.log('   🎉 All performance targets achieved!');
    } else {
      console.log('   🎯 Performance improvements needed');
    }
  }
}

// Test implementations
async function testLCP() {
  return new Promise((resolve) => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        resolve(entries[entries.length - 1].startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Fallback timeout
    setTimeout(() => resolve(5000), 5000);
  });
}

async function testFCP() {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  return fcpEntry ? fcpEntry.startTime : 0;
}

async function testCLS() {
  return new Promise((resolve) => {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      // Return CLS after a reasonable observation period
      setTimeout(() => resolve(clsValue), 2000);
    }).observe({ entryTypes: ['layout-shift'] });
  });
}

async function testResourceLoadTime() {
  const navigation = performance.getEntriesByType('navigation')[0];
  return navigation.loadEventEnd - navigation.fetchStart;
}

async function testDOMContentLoaded() {
  const navigation = performance.getEntriesByType('navigation')[0];
  return navigation.domContentLoadedEventEnd - navigation.fetchStart;
}

async function testImageLazyLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  return lazyImages.length;
}

async function testCriticalResourceCount() {
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  return preloadLinks.length;
}

async function testWebWorkerSupport() {
  return typeof Worker !== 'undefined' ? 1 : 0;
}

// Run tests when page is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    // Wait a bit for metrics to stabilize
    setTimeout(async () => {
      const testSuite = new PerformanceTestSuite();

      // Core Web Vitals 2026 Tests
      testSuite.addTest('LCP < 1.8s', testLCP, 1800, '<=');
      testSuite.addTest('FCP < 1.0s', testFCP, 1000, '<=');
      testSuite.addTest('CLS < 0.05', testCLS, 0.05, '<=');

      // Performance optimization tests
      testSuite.addTest('Total Load Time < 3s', testResourceLoadTime, 3000, '<=');
      testSuite.addTest('DOM Content Loaded < 1.5s', testDOMContentLoaded, 1500, '<=');
      testSuite.addTest('Lazy Loading Implemented', testImageLazyLoading, 5, '>=');
      testSuite.addTest('Critical Resource Preloading', testCriticalResourceCount, 3, '>=');
      testSuite.addTest('Web Worker Support', testWebWorkerSupport, 1, '===');

      const results = await testSuite.runAllTests();

      // Store results globally for debugging
      window.performanceTestResults = results;

    }, 2000);
  });
}

export { PerformanceTestSuite };