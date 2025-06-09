// Privacy-focused analytics implementation
// Using a lightweight, self-hosted approach to respect user privacy

class Analytics {
  constructor() {
    this.queue = [];
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.checkConsent();
  }

  // Generate unique session ID
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if user has consented to analytics
  checkConsent() {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'true';
  }

  // Set user consent
  setConsent(consent) {
    this.isEnabled = consent;
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (consent) {
      this.track('analytics_enabled');
    }
  }

  // Track page view
  trackPageView(page, additionalData = {}) {
    if (!this.isEnabled) return;

    const event = {
      type: 'page_view',
      page,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...additionalData
    };

    this.sendEvent(event);
  }

  // Track grant view
  trackGrantView(grantId, grantName, organization) {
    if (!this.isEnabled) return;

    const event = {
      type: 'grant_view',
      grantId,
      grantName,
      organization,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);

    // Also update view count in database
    this.updateGrantViewCount(grantId);
  }

  // Track search
  trackSearch(query, resultsCount, filters = {}) {
    if (!this.isEnabled) return;

    const event = {
      type: 'search',
      query: this.anonymizeQuery(query),
      resultsCount,
      filters,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track filter usage
  trackFilterUsage(filterType, filterValue) {
    if (!this.isEnabled) return;

    const event = {
      type: 'filter_used',
      filterType,
      filterValue,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track external link clicks
  trackExternalLink(url, grantId = null) {
    if (!this.isEnabled) return;

    const event = {
      type: 'external_link_click',
      url: this.anonymizeUrl(url),
      grantId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track chat interactions
  trackChatInteraction(action, data = {}) {
    if (!this.isEnabled) return;

    const event = {
      type: 'chat_interaction',
      action, // 'opened', 'message_sent', 'grant_recommended', etc.
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track errors
  trackError(error, context = {}) {
    // Always track errors for debugging, regardless of consent
    const event = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event, true);
  }

  // Track performance metrics
  trackPerformance(metric, value, unit = 'ms') {
    if (!this.isEnabled) return;

    const event = {
      type: 'performance',
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Anonymize search queries to protect privacy
  anonymizeQuery(query) {
    // Remove potential PII like email addresses, phone numbers
    return query
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]')
      .substring(0, 100); // Limit length
  }

  // Anonymize URLs
  anonymizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return 'invalid_url';
    }
  }

  // Update grant view count in database
  async updateGrantViewCount(grantId) {
    try {
      await fetch('/.netlify/functions/grants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'incrementView',
          grantId
        })
      });
    } catch (error) {
      console.error('Failed to update view count:', error);
    }
  }

  // Send event to analytics endpoint
  async sendEvent(event, force = false) {
    if (!this.isEnabled && !force) return;

    // Add common properties
    event.userAgent = navigator.userAgent;
    event.language = navigator.language;
    event.screenResolution = `${window.screen.width}x${window.screen.height}`;
    event.viewport = `${window.innerWidth}x${window.innerHeight}`;
    event.referrer = document.referrer ? this.anonymizeUrl(document.referrer) : null;

    // Add to queue
    this.queue.push(event);

    // Batch send events
    if (this.queue.length >= 10 || force) {
      this.flush();
    }
  }

  // Flush event queue
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/.netlify/functions/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events to queue on failure
      this.queue.unshift(...events);
    }
  }

  // Initialize performance observer
  initPerformanceObserver() {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    // Track Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance('lcp', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // Track First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackPerformance('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    try {
      const response = await fetch('/.netlify/functions/analytics?action=summary');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error);
      return null;
    }
  }

  // Get popular grants
  async getPopularGrants(limit = 10) {
    try {
      const response = await fetch(`/.netlify/functions/analytics?action=popular&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch popular grants:', error);
      return [];
    }
  }

  // Get search trends
  async getSearchTrends(days = 7) {
    try {
      const response = await fetch(`/.netlify/functions/analytics?action=searchTrends&days=${days}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch search trends:', error);
      return [];
    }
  }
}

// Create singleton instance
const analytics = new Analytics();

// Initialize performance observer when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    analytics.initPerformanceObserver();
  });

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    analytics.flush();
  });
}

export default analytics;