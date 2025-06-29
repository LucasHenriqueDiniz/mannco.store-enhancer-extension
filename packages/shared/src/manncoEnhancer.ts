/**
 * Mannco.store Enhancer - Conjunto de funções para melhorar a experiência no site
 * @deprecated Use modules from mannco/enhancer.ts instead
 */

import { EnhancerOptions } from './config/enhancerOptions';
import {
  addExtraItemInfo,
  calculateFees,
  enhanceGiveawaysPage,
  enhanceUI,
  highlightDeals,
} from './index.js';
import {
  applyAllEnhancements,
  extractItemInfo,
  processGiveaways,
  processInventoryPage,
  removeGlobalAlert,
} from './mannco/enhancer';
import { injectCSS, isOnPage } from './mannco/core';

// Re-export the functions from the new centralized modules for backward compatibility
export {
  applyAllEnhancements,
  removeGlobalAlert,
  processGiveaways,
  extractItemInfo,
  processInventoryPage,
  injectCSS,
  isOnPage,
};

// Re-export the legacy interface for backward compatibility
// This will be removed in future versions
export interface LegacyEnhancerOptions {
  improveUI: boolean;
  showExtraInfo: boolean;
  customFeatures: Record<string, boolean>;
}

export const DEFAULT_OPTIONS: LegacyEnhancerOptions = {
  improveUI: true,
  showExtraInfo: true,
  customFeatures: {
    calculateFees: true,
    highlightDeals: true,
  },
};

// Legacy enhance item page function - for backward compatibility
export function enhanceItemPage(): void {
  if (!isOnPage('/item/')) return;

  console.log('MannCo Enhancer: Enhancing item page');

  const itemContainer = document.querySelector('#content > div:nth-child(3)');
  if (itemContainer) {
    // Modify styles
    Object.assign(itemContainer.style, {
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      padding: '10px',
      boxShadow: '0 0 10px rgba(76, 175, 80, 0.6)',
    });
  }
}
