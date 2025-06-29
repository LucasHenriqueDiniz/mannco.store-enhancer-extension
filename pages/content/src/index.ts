import {
  applyAllEnhancements,
  removeGlobalAlert,
  processGiveaways,
  enhanceItemPage,
  processInventoryPage,
} from '@extension/shared';

// Function to check if we're on the mannco.store site
function isManncoStore() {
  const isOnMannco = window.location.hostname === 'mannco.store';
  console.log(
    `Mannco.store Enhancer - Site check: ${isOnMannco ? 'On mannco.store' : 'Not on mannco.store'} (${window.location.hostname})`,
  );
  return isOnMannco;
}

// Enhanced logging function
function logEnhancer(message: string, data?: any) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // Just time HH:MM:SS
  const prefix = `[Mannco Enhancer ${timestamp}]`;

  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }

  // Also send to background script for additional logging
  try {
    chrome.runtime
      .sendMessage({
        action: 'logInfo',
        data: { message, data, timestamp, url: window.location.href },
      })
      .catch(err => console.error(`${prefix} Failed to send log to background:`, err));
  } catch (e) {
    console.error(`${prefix} Error sending log:`, e);
  }
}

// Apply enhancements with better error handling
function applyEnhancementsWithLogging() {
  logEnhancer('Applying enhancements to page', {
    url: window.location.href,
    path: window.location.pathname,
  });

  try {
    // Check if the extension is enabled (default to true if setting not found)
    chrome.runtime.sendMessage({ action: 'getStatus' }, response => {
      if (response?.enabled) {
        logEnhancer('Extension is enabled, applying enhancements');

        try {
          // Get options and apply with the user's settings
          chrome.runtime.sendMessage({ action: 'getOptions' }, optionsResponse => {
            logEnhancer('Got options from storage', optionsResponse?.options);

            try {
              applyAllEnhancements(optionsResponse?.options);
              logEnhancer('Enhancements applied successfully');
            } catch (enhancementError) {
              logEnhancer('Error applying enhancements', enhancementError);
            }
          });
        } catch (optionsError) {
          logEnhancer('Error getting options, using defaults', optionsError);
          // Apply with default options if we can't get the stored ones
          applyAllEnhancements();
        }
      } else {
        logEnhancer('Extension is disabled, not applying enhancements');
      }
    });
  } catch (error) {
    logEnhancer('Critical error checking extension status', error);
  }
}

// Main function to initialize the extension
function init() {
  logEnhancer('Content script initializing');

  if (isManncoStore()) {
    logEnhancer('We are on mannco.store, setting up enhancer');

    // Apply immediately if document is already loaded
    if (document.readyState === 'complete') {
      logEnhancer('Document already loaded, applying enhancements immediately');
      applyEnhancementsWithLogging();
    } else {
      // Otherwise wait for load event
      logEnhancer('Waiting for document to load completely');
      window.addEventListener('load', () => {
        logEnhancer('Document loaded event fired');
        applyEnhancementsWithLogging();
      });
    }

    // Set up MutationObserver to handle dynamic content with better error handling
    try {
      logEnhancer('Setting up mutation observer for dynamic content');
      const observer = new MutationObserver(mutations => {
        try {
          // Check for significant DOM changes that might require reapplying enhancements
          const shouldReapply = mutations.some(
            mutation =>
              (mutation.addedNodes.length > 0 && (mutation.target as Element).id === 'content') ||
              (mutation.target as Element).id === 'main',
          );

          if (shouldReapply) {
            logEnhancer('Significant DOM changes detected, reapplying specific enhancements');
            setTimeout(() => {
              try {
                removeGlobalAlert();
                processGiveaways();
                enhanceItemPage();
                processInventoryPage();
                logEnhancer('Specific enhancements reapplied after DOM changes');
              } catch (reapplyError) {
                logEnhancer('Error reapplying enhancements after DOM changes', reapplyError);
              }
            }, 500);
          }
        } catch (observerError) {
          logEnhancer('Error in mutation observer callback', observerError);
        }
      });

      // Start observing the document body with the configured parameters
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      logEnhancer('Mutation observer started successfully');
    } catch (observerSetupError) {
      logEnhancer('Failed to setup mutation observer', observerSetupError);
    }
  } else {
    logEnhancer('Not on mannco.store, skipping enhancement setup');
  }
}

// Initialize the script with error handling
try {
  logEnhancer('Content script loaded, starting initialization');
  init();
} catch (e) {
  logEnhancer('Critical error during content script initialization', e);
}

// Export an empty object to satisfy module requirements
export {};
