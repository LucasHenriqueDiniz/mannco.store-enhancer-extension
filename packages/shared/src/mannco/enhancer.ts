/**
 * Mannco.store Enhancer - Core initialization and functionality
 */

import { DEFAULT_OPTIONS, EnhancerOptions, loadEnhancerOptions } from '../config/enhancerOptions';
import {
  addExtraItemInfo,
  calculateFees,
  enhanceGiveawaysPage,
  enhanceUI,
  highlightDeals,
} from '../index';
import { extractPriceValue, injectCSS, isOnPage } from './core';

/**
 * Remove global alert on all pages
 */
export function removeGlobalAlert(): void {
  const globalAlert = document.querySelector('#content > div.global-alert.my-4.rounded-2');
  if (globalAlert) {
    console.log('MannCo Enhancer: Removing global alert');
    globalAlert.remove();
  }
}

/**
 * Process giveaways page
 */
export function processGiveaways(): void {
  if (!isOnPage('/giveaways')) return;

  console.log('MannCo Enhancer: Processing giveaways page');

  const giveaways = document.querySelectorAll(
    '#main > div > div.raffle-list.list-group.rfl > a.raffle-list__item.list-group-item.list-group-item-action.is-official.raffleitem.isv',
  );

  giveaways.forEach((giveaway, index) => {
    const title = giveaway.querySelector('.raffle-list__title')?.textContent?.trim() || 'Unknown';
    console.log(`MannCo Enhancer Giveaway ${index + 1}:`, {
      title: title,
      element: giveaway,
    });
  });
}

/**
 * Enhance item page
 */
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

/**
 * Process inventory page - including tab change detection
 */
export function processInventoryPage(): void {
  if (!isOnPage('/inventory')) return;

  console.log('MannCo Enhancer: Processing inventory page');

  // Create and inject CSS
  const inventoryCSS = `
    .profitable-item {
      border: 2px solid #4CAF50 !important;
      border-radius: 5px !important;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5) !important;
    }
    
    .highlight-btn {
      margin-left: 10px;
      padding: 5px 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
    }
  `;

  injectCSS(inventoryCSS, 'mannco-inventory-styles');

  // Setup tab change observer
  setupTabChangeObserver();

  // Add highlight buttons
  createHighlightButtons();
}

/**
 * Extracts item information
 */
export function extractItemInfo(itemElement: Element): Record<string, any> {
  if (!itemElement) return {};

  return {
    name: itemElement.getAttribute('data-name') || '',
    id: itemElement.getAttribute('data-id') || '',
    quantity: itemElement.getAttribute('data-id')?.length || 0,
    game: itemElement.getAttribute('data-h-game') || '',
    price: itemElement.getAttribute('data-h-price') || '',
    url: itemElement.getAttribute('data-url') || '',
    nbType: itemElement.getAttribute('data-nb') || '',
    image: itemElement.querySelector('.item-picture')?.getAttribute('src') || '',
  };
}

/**
 * Helper function for inventory page highlight buttons
 */
function createHighlightButtons(): void {
  // Wait for the tabs to be available in the DOM
  const waitForTabs = setInterval(() => {
    const onSaleTab = document.getElementById('tab-on-sale');
    const inventoryTab = document.getElementById('tab-site-inventory');

    if (onSaleTab && inventoryTab) {
      clearInterval(waitForTabs);

      // Create buttons for each tab
      createHighlightButton('tab-on-sale', '#on-sale-items');
      createHighlightButton('tab-site-inventory', '#site-inventory-items');
    }
  }, 1000);

  // Stop checking after 10 seconds
  setTimeout(() => clearInterval(waitForTabs), 10000);
}

/**
 * Helper function to create a highlight button
 */
function createHighlightButton(
  tabId: string,
  itemsContainerSelector: string,
): HTMLButtonElement | null {
  const tab = document.getElementById(tabId);
  if (!tab) return null;

  const cardHead = tab.querySelector('.card-head');
  if (!cardHead) return null;

  // Check if button already exists
  const existingBtn = cardHead.querySelector(`#highlightProfitBtn-${tabId}`);
  if (existingBtn) return existingBtn as HTMLButtonElement;

  // Create button
  const button = document.createElement('button');
  button.id = `highlightProfitBtn-${tabId}`;
  button.className = 'highlight-btn';
  button.textContent = '🔍 Destacar Lucros';

  // Add click event
  button.addEventListener('click', () => {
    const itemsContainer = document.querySelector(itemsContainerSelector);
    if (!itemsContainer) return;

    const count = highlightProfitableItems(itemsContainer);

    // Update button text temporarily
    const originalText = button.textContent;
    button.textContent = `🔍 Destacar Lucros (${count})`;
    setTimeout(() => {
      button.textContent = originalText;
    }, 3000);

    console.log(`MannCo Enhancer: Highlighted ${count} profitable items in ${tabId}`);
  });

  // Append button to UI
  const h3 = cardHead.querySelector('h3');
  if (h3) {
    h3.appendChild(button);
  } else {
    cardHead.appendChild(button);
  }

  return button;
}

/**
 * Helper function to highlight profitable items
 */
function highlightProfitableItems(itemsContainer: Element): number {
  const items = itemsContainer.querySelectorAll('li');
  let count = 0;

  items.forEach(item => {
    // Clear previous highlighting
    item.classList.remove('profitable-item');

    const lowestPriceElement = item.querySelector('.item-lowest-price span');
    const steamPriceElement = item.querySelector('.item-highest-sprice span');

    if (lowestPriceElement && steamPriceElement) {
      const lowestPrice = extractPriceValue(lowestPriceElement.textContent || '');
      const steamPrice = extractPriceValue(steamPriceElement.textContent || '');

      if (lowestPrice > 0 && steamPrice > 0) {
        const profitMargin = (steamPrice - lowestPrice) / steamPrice;

        if (profitMargin > 0.2) {
          // 20% profit threshold
          item.classList.add('profitable-item');
          item.setAttribute('data-profit-margin', profitMargin.toFixed(2));
          count++;
        }
      }
    }
  });

  return count;
}

/**
 * Helper function to setup tab change observer
 */
function setupTabChangeObserver(): void {
  const tabs = document.querySelectorAll('[role="tab"]');

  // Create observer for tab changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target as Element;
        if (target.classList.contains('active')) {
          console.log(`MannCo Enhancer: Tab changed to ${target.id}`);
        }
      }
    });
  });

  // Observe each tab
  tabs.forEach(tab => {
    observer.observe(tab, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });
}

/**
 * Main function that applies all enhancements based on options
 */
export async function applyAllEnhancements(
  optionsOverride?: Partial<EnhancerOptions>,
): Promise<void> {
  console.log('MannCo.Store Enhancer: Applying enhancements...');

  // Load saved options or use defaults
  let options: EnhancerOptions;

  if (optionsOverride) {
    // Use provided options, merged with defaults
    options = { ...DEFAULT_OPTIONS };
    // Simple merge for top-level properties
    for (const key in optionsOverride) {
      if (key in options) {
        Object.assign(
          options[key as keyof EnhancerOptions],
          optionsOverride[key as keyof EnhancerOptions],
        );
      }
    }
  } else {
    // Load from storage
    options = await loadEnhancerOptions();
  }

  // Global enhancements
  if (options.global.removeGlobalAlerts) {
    removeGlobalAlert();
  }

  // UI enhancements
  if (options.global.improveUI) {
    enhanceUI();
    enhanceGiveawaysPage();
    enhanceItemPage();
    processInventoryPage();
  }

  // Extra info
  if (options.global.showExtraInfo) {
    addExtraItemInfo();
    processGiveaways();
  }

  // Features
  if (options.features.calculateFees) {
    calculateFees();
  }

  if (options.features.highlightDeals) {
    highlightDeals();
  }

  console.log('MannCo.Store Enhancer: Enhancements applied successfully!');

  return options;
}
