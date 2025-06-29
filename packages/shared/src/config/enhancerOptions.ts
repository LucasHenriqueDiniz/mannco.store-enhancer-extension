/**
 * Mannco.store Enhancer - Centralized Options Management
 * This file serves as the single source of truth for all extension options
 */

/**
 * Complete interface for all enhancer options
 */
export interface EnhancerOptions {
  // Global options
  global: {
    removeGlobalAlerts: boolean;
    removeSteamProblemsAlert: boolean;
    addScrollToTopButton: boolean;
    addSortOptions: boolean;
    improveUI: boolean;
    showExtraInfo: boolean;
  };

  // Features options
  features: {
    calculateFees: boolean;
    highlightDeals: boolean;
  };

  // Page-specific options
  itemPage: {
    moveSalesHistoryBelowBuyOrder: boolean;
    makeSalesHistoryCollapsible: boolean;
    addMatchButton: boolean;
    createProfitTable: boolean;
    showPriceComparisons: boolean;
    removeBreadcrumbs: boolean;
    showMarketPrices: boolean;
    enhanceItemDescriptions: boolean;
  };

  inventoryPage: {
    addQuickUpdate: boolean;
    addWithdrawnPaintedButton: boolean;
    addMarkPaintedButton: boolean;
    addPriceComparisons: boolean;
    markSteamProfitItems: boolean;
    autoShowOnlyUndercut: boolean;
    autoMatchPriceOnSelection: boolean;
    autoSuggestPriceOnSelection: boolean;
    addMassDelistButton: boolean;
    addQuickOffersButton: boolean;
    removeBreadcrumbs: boolean;
    highlightProfitItems: boolean;
    autoRefresh: boolean;
  };

  giveawaysPage: {
    addQuickJoinButton: boolean;
    showMissingGiveaways: boolean;
    alertOnNewGiveaway: boolean;
    highlightLowEntries: boolean;
    showEndTime: boolean;
  };

  profilePage: {
    addExportTransactionHistory: boolean;
    addExportCashouts: boolean;
    addExportBuyOrders: boolean;
    autoShowOnlyUndercut: boolean;
    showItemValueWithCommission: boolean;
    removeBreadcrumbs: boolean;
  };

  auctionsPage: {
    borderProfitItems: boolean;
  };

  mainPage: {
    enableNewMainPage: boolean;
    removePhysicalAndGiftCards: boolean;
    removeDota2Section: boolean;
    removeRustSection: boolean;
    removeCS2Section: boolean;
    removeTF2Section: boolean;
    removeBanner: boolean;
    removeFAQ: boolean;
  };

  offersPage: {
    addDeclineAllBadOffersButton: boolean;
    badOfferThresholdPercent: number;
  };

  tradesPage: {
    autoResendAll: boolean;
  };

  bundlesPage: {
    showIndividualPricesAndProfit: boolean;
  };
}

/**
 * Default options configuration
 */
export const DEFAULT_OPTIONS: EnhancerOptions = {
  global: {
    removeGlobalAlerts: true,
    removeSteamProblemsAlert: true,
    addScrollToTopButton: true,
    addSortOptions: true,
    improveUI: true,
    showExtraInfo: true,
  },

  features: {
    calculateFees: true,
    highlightDeals: true,
  },

  itemPage: {
    moveSalesHistoryBelowBuyOrder: true,
    makeSalesHistoryCollapsible: true,
    addMatchButton: true,
    createProfitTable: true,
    showPriceComparisons: true,
    removeBreadcrumbs: true,
    showMarketPrices: true,
    enhanceItemDescriptions: true,
  },

  inventoryPage: {
    addQuickUpdate: true,
    addWithdrawnPaintedButton: true,
    addMarkPaintedButton: true,
    addPriceComparisons: true,
    markSteamProfitItems: true,
    autoShowOnlyUndercut: false,
    autoMatchPriceOnSelection: false,
    autoSuggestPriceOnSelection: false,
    addMassDelistButton: true,
    addQuickOffersButton: true,
    removeBreadcrumbs: true,
    highlightProfitItems: true,
    autoRefresh: false,
  },

  giveawaysPage: {
    addQuickJoinButton: true,
    showMissingGiveaways: true,
    alertOnNewGiveaway: true,
    highlightLowEntries: true,
    showEndTime: true,
  },

  profilePage: {
    addExportTransactionHistory: true,
    addExportCashouts: true,
    addExportBuyOrders: true,
    autoShowOnlyUndercut: false,
    showItemValueWithCommission: true,
    removeBreadcrumbs: true,
  },

  auctionsPage: {
    borderProfitItems: true,
  },

  mainPage: {
    enableNewMainPage: true,
    removePhysicalAndGiftCards: true,
    removeDota2Section: false,
    removeRustSection: false,
    removeCS2Section: false,
    removeTF2Section: false,
    removeBanner: true,
    removeFAQ: true,
  },

  offersPage: {
    addDeclineAllBadOffersButton: true,
    badOfferThresholdPercent: 10,
  },

  tradesPage: {
    autoResendAll: false,
  },

  bundlesPage: {
    showIndividualPricesAndProfit: true,
  },
};

/**
 * Load options from storage
 */
export async function loadEnhancerOptions(): Promise<EnhancerOptions> {
  return new Promise(resolve => {
    chrome.storage.local.get(['enhancerOptions'], data => {
      if (data.enhancerOptions) {
        // Merge with defaults to ensure all properties exist
        resolve(mergeWithDefaults(data.enhancerOptions));
      } else {
        resolve({ ...DEFAULT_OPTIONS });
      }
    });
  });
}

/**
 * Save options to storage
 */
export async function saveEnhancerOptions(options: EnhancerOptions): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set(
      {
        enhancerOptions: options,
      },
      () => {
        resolve();
      },
    );
  });
}

/**
 * Helper to ensure all default properties exist in loaded options
 */
function mergeWithDefaults(savedOptions: Partial<EnhancerOptions>): EnhancerOptions {
  const result = { ...DEFAULT_OPTIONS };

  // Recursively merge objects
  function deepMerge(target: any, source: any) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        deepMerge(target[key], source[key]);
      } else if (key in target) {
        target[key] = source[key];
      }
    }
  }

  deepMerge(result, savedOptions);
  return result;
}

/**
 * Get legacy options structure for backward compatibility
 * @deprecated Use the new options structure directly
 */
export function getLegacyOptionsFormat(options: EnhancerOptions): any {
  return {
    improveUI: options.global.improveUI,
    showExtraInfo: options.global.showExtraInfo,
    customFeatures: {
      calculateFees: options.features.calculateFees,
      highlightDeals: options.features.highlightDeals,
    },
    removeGlobalAlert: options.global.removeGlobalAlerts,
  };
}
