/**
 * Monetag Ads Controller - MojQuiz
 * Manages ad placement and prevents interference with user interactions.
 *
 * Page types:
 *   - quiz     : Active quiz gameplay (NO intrusive ads)
 *   - result   : Quiz results (ads between sections)
 *   - category : Category/difficulty selection pages
 *   - home     : Homepage
 *   - content  : Blog posts, articles, trivia pages
 *   - utility  : About, FAQ, Contact, Privacy, Terms, etc.
 */

(function () {
  'use strict';

  // --- Page Type Detection ---
  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    const file = path.split('/').pop().replace('.html', '');

    if (file === 'quiz') return 'quiz';
    if (file === 'result') return 'result';
    if (file === '' || file === 'index') return 'home';

    const categoryPages = [
      'general-knowledge', 'current-affairs', 'competitive-exams',
      'daily-quiz', 'science', 'history', 'geography', 'sports',
      'entertainment', 'technology', 'literature', 'mathematics', 'music'
    ];
    if (categoryPages.includes(file)) return 'category';

    const utilityPages = [
      'about', 'faq', 'contact', 'privacy', 'terms',
      'achievements', 'leaderboards', 'dashboard', 'resources',
      'clear-cache', '404'
    ];
    if (utilityPages.includes(file)) return 'utility';

    // Everything else is content (blog posts, trivia articles, etc.)
    return 'content';
  }

  // --- Quiz Protection ---
  function enableQuizProtection() {
    document.body.classList.add('quiz-active');

    // Monitor for third-party overlays and suppress them
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return; // Only element nodes

          const style = window.getComputedStyle(node);
          const isFixed = style.position === 'fixed';
          const isAbsolute = style.position === 'absolute';
          const highZIndex = parseInt(style.zIndex) > 100;

          // Check if it's a third-party overlay (not our own)
          const isOurElement = node.id === 'exitModal' ||
            node.classList.contains('app-bar') ||
            node.classList.contains('cookie-banner') ||
            node.classList.contains('side-menu') ||
            node.classList.contains('menu-overlay') ||
            node.classList.contains('toast-container') ||
            node.classList.contains('toast') ||
            node.closest('.app-bar') ||
            node.closest('#exitModal') ||
            node.closest('.side-menu');

          if ((isFixed || (isAbsolute && highZIndex)) && !isOurElement) {
            // Push third-party overlay behind quiz elements
            node.style.setProperty('z-index', '1', 'important');
            node.style.setProperty('pointer-events', 'none', 'important');
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer reference for cleanup
    window._monetagQuizObserver = observer;
  }

  function disableQuizProtection() {
    document.body.classList.remove('quiz-active');
    if (window._monetagQuizObserver) {
      window._monetagQuizObserver.disconnect();
      window._monetagQuizObserver = null;
    }
  }

  // --- Banner Ad Injection ---
  function injectBannerAd(targetSelector, position, adClass) {
    const target = document.querySelector(targetSelector);
    if (!target) return null;

    const container = document.createElement('div');
    container.className = 'monetag-ad-container ' + (adClass || '');

    const label = document.createElement('span');
    label.className = 'monetag-ad-label';
    label.textContent = 'Advertisement';
    container.appendChild(label);

    // Monetag Native Banner ad zone
    const adDiv = document.createElement('div');
    adDiv.id = 'monetag-banner-' + Math.random().toString(36).substr(2, 6);
    container.appendChild(adDiv);

    if (position === 'before') {
      target.parentNode.insertBefore(container, target);
    } else if (position === 'after') {
      target.parentNode.insertBefore(container, target.nextSibling);
    } else if (position === 'inside-start') {
      target.insertBefore(container, target.firstChild);
    } else if (position === 'inside-end') {
      target.appendChild(container);
    }

    return container;
  }

  // --- Page-Specific Ad Setup ---
  function setupAds() {
    const pageType = detectPageType();

    switch (pageType) {
      case 'quiz':
        // MINIMAL ads during quiz - only enable quiz protection
        enableQuizProtection();

        // Listen for quiz completion to relax protection
        window.addEventListener('beforeunload', disableQuizProtection);
        break;

      case 'result':
        // Ads are welcome on result page - user is between actions
        injectBannerAd('.action-buttons', 'before', 'ad-banner-mid result-ad-slot');
        break;

      case 'home':
        // Ad after the categories section (before quick challenge)
        injectBannerAd('.quick-challenge-section', 'after', 'ad-banner-mid');
        // Ad before footer
        injectBannerAd('.home-footer', 'before', 'ad-banner-bottom');
        break;

      case 'category':
        // Ad between content and difficulty buttons
        injectBannerAd('.difficulty-section', 'before', 'ad-banner-mid');
        break;

      case 'content':
        // Blog/article pages - ads between sections
        var contentSections = document.querySelectorAll('main > div, main > section, .category-container > div');
        if (contentSections.length > 3) {
          // Place ad after the 2nd content section
          var afterSection = contentSections[2];
          if (afterSection) {
            injectBannerAd(null, null, 'ad-banner-mid');
            // Manual insertion since we have the element
            var adContainer = document.createElement('div');
            adContainer.className = 'monetag-ad-container ad-banner-mid';
            var adLabel = document.createElement('span');
            adLabel.className = 'monetag-ad-label';
            adLabel.textContent = 'Advertisement';
            adContainer.appendChild(adLabel);
            afterSection.parentNode.insertBefore(adContainer, afterSection.nextSibling);
          }
        }
        break;

      case 'utility':
        // Minimal ads on utility pages - just one before footer
        var footer = document.querySelector('footer');
        if (footer) {
          injectBannerAd('footer', 'before', 'ad-banner-bottom');
        }
        break;
    }
  }

  // --- Initialize ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAds);
  } else {
    setupAds();
  }

  // Expose for external control
  window.MonetAds = {
    detectPageType: detectPageType,
    enableQuizProtection: enableQuizProtection,
    disableQuizProtection: disableQuizProtection
  };
})();
