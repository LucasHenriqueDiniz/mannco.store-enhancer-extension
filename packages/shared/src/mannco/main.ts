/**
 * Mannco.store Enhancer - Main functionality
 * This is the entry point for the enhancer functionality
 */
import type { EnhancerConfig } from '../config/index.js';
import { ConfigManager } from '../config/index.js';
import { isOnPage, addScrollToTopButton, removeElement } from '../utils/dom.js';
import { enhanceItemPage } from './itemPage.js';
import { processInventoryPage } from './inventoryPage.js';
import { enhanceGiveawaysPage } from './giveaways.js';

/**
 * Enhancer logger
 */
export function logEnhancer(message: string, error?: any): void {
  console.log(
    `%cMannCo Enhancer: %c${message}`,
    'color: #4CAF50; font-weight: bold',
    'color: inherit',
  );
  if (error) {
    console.error('MannCo Enhancer Error:', error);
  }
}

/**
 * Remove global alerts that appear on all pages
 */
function applyGlobalEnhancements(config: EnhancerConfig): void {
  logEnhancer('Applying global enhancements');

  if (config.global.removeGlobalAlerts) {
    removeElement('#content > div.global-alert.my-4.rounded-2');
    logEnhancer('Removed global alerts');
  }

  if (config.global.removeSteamProblemsAlert) {
    removeElement('#content > .alert.alert-warning');
    logEnhancer('Removed Steam problems alert');
  }

  if (config.global.addScrollToTopButton) {
    addScrollToTopButton();
  }

  // Add other global enhancements here
}

/**
 * Apply page-specific enhancements based on the current URL
 */
function applyPageSpecificEnhancements(config: EnhancerConfig): void {
  // Item page enhancements
  if (isOnPage('/item/')) {
    logEnhancer('Detected item page, applying enhancements');
    enhanceItemPage(config.itemPage);
  }

  // Inventory page enhancements
  if (isOnPage('/inventory')) {
    logEnhancer('Detected inventory page, applying enhancements');
    processInventoryPage(config.inventoryPage);
  }

  // Giveaways page enhancements
  if (isOnPage('/giveaways')) {
    logEnhancer('Detected giveaways page, applying enhancements');
    enhanceGiveawaysPage(config.giveawaysPage);
  }

  // Add other page-specific enhancements here as needed
  // Profile page
  // if (isOnPage('/profile')) { ... }

  // Main page
  // if (isOnPage('/')) { ... }
}

/**
 * Set up MutationObserver to handle dynamic content changes
 */
function setupDynamicContentObserver(): MutationObserver {
  logEnhancer('Setting up mutation observer for dynamic content');

  const observer = new MutationObserver(mutations => {
    // Check if significant DOM changes occurred
    const significantChanges = mutations.some(
      mutation =>
        mutation.type === 'childList' &&
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(
          node =>
            node instanceof HTMLElement &&
            (node.classList.contains('container') ||
              node.classList.contains('card') ||
              node.id === 'content'),
        ),
    );

    if (significantChanges) {
      logEnhancer('Significant DOM changes detected, reapplying enhancements');
      initEnhancer();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Main function to initialize the enhancer
 */
export async function initEnhancer(): Promise<void> {
  logEnhancer('Initializing enhancer');

  try {
    // Initialize configuration
    const configManager = ConfigManager.getInstance();
    await configManager.initialize();
    const config = configManager.getConfig();

    // Apply global enhancements
    applyGlobalEnhancements(config);

    // Apply page-specific enhancements
    applyPageSpecificEnhancements(config);

    logEnhancer('All enhancements applied successfully');
  } catch (error) {
    logEnhancer('Error applying enhancements', error);
  }
}

// Export everything needed
export { ConfigManager };

// When this file is executed directly
if (typeof window !== 'undefined') {
  logEnhancer('Main module loaded');
}
