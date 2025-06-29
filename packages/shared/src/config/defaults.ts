/**
 * Mannco.store Enhancer - Default Configuration Values
 * Provides sensible defaults for all configuration options
 */

import type {
  EnhancerConfig,
  GlobalConfig,
  ItemPageConfig,
  InventoryPageConfig,
  GiveawaysPageConfig,
} from './types';

/**
 * Default global configuration
 */
export const defaultGlobalConfig: GlobalConfig = {
  removeGlobalAlerts: false,
  removeSteamProblemsAlert: true,
  addScrollToTopButton: true,
  enableDebugLogging: false,
  applyCustomTheme: false,
  customThemeColor: '#4CAF50',
};

/**
 * Default item page configuration
 */
export const defaultItemPageConfig: ItemPageConfig = {
  removeBreadcrumbs: false,
  showPriceComparisons: true,
  moveSalesHistory: true,
  collapsableSalesHistory: true,
  addMatchButton: true,
  createProfitTable: true,
  highlightGoodDeals: true,
  goodDealThresholdPercent: 10,
};

/**
 * Default inventory page configuration
 */
export const defaultInventoryPageConfig: InventoryPageConfig = {
  addBulkSelection: true,
  addPriceSorting: true,
  enhanceSearch: true,
  addQuickSell: true,
  rememberFilters: true,
};

/**
 * Default giveaways page configuration
 */
export const defaultGiveawaysPageConfig: GiveawaysPageConfig = {
  autoJoinGiveaways: false,
  addCountdownTimers: true,
  filterByValue: false,
  minimumValue: 0.1,
  notifyNewGiveaways: true,
};

/**
 * Complete default configuration
 */
export const defaultConfig: EnhancerConfig = {
  schemaVersion: 1,
  global: defaultGlobalConfig,
  itemPage: defaultItemPageConfig,
  inventoryPage: defaultInventoryPageConfig,
  giveawaysPage: defaultGiveawaysPageConfig,
};
