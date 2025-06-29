/**
 * Mannco.store Enhancer - Configuration Types
 * Defines configuration structure for the enhancer
 */

/**
 * Global enhancement options applicable to all pages
 */
export interface GlobalConfig {
  /** Remove global alerts (e.g., announcements) */
  removeGlobalAlerts: boolean;

  /** Remove Steam problem alerts */
  removeSteamProblemsAlert: boolean;

  /** Add a scroll-to-top button */
  addScrollToTopButton: boolean;

  /** Enable debug logging */
  enableDebugLogging: boolean;

  /** Apply custom theme */
  applyCustomTheme: boolean;

  /** Custom theme color (hex) */
  customThemeColor: string;
}

/**
 * Item page specific enhancements
 */
export interface ItemPageConfig {
  /** Remove breadcrumbs from item page */
  removeBreadcrumbs: boolean;

  /** Show price comparison with Steam */
  showPriceComparisons: boolean;

  /** Move sales history to a more convenient position */
  moveSalesHistory: boolean;

  /** Make the sales history collapsible */
  collapsableSalesHistory: boolean;

  /** Add a button to automatically match the lowest price */
  addMatchButton: boolean;

  /** Create a profit analysis table */
  createProfitTable: boolean;

  /** Highlight good deals (based on Steam price difference) */
  highlightGoodDeals: boolean;

  /** Good deal threshold percentage */
  goodDealThresholdPercent: number;
}

/**
 * Inventory page specific enhancements
 */
export interface InventoryPageConfig {
  /** Add bulk selection tools */
  addBulkSelection: boolean;

  /** Add price sorting options */
  addPriceSorting: boolean;

  /** Add search filters */
  enhanceSearch: boolean;

  /** Add quick sell buttons */
  addQuickSell: boolean;

  /** Remember inventory filters between sessions */
  rememberFilters: boolean;
}

/**
 * Giveaways page specific enhancements
 */
export interface GiveawaysPageConfig {
  /** Auto-join giveaways */
  autoJoinGiveaways: boolean;

  /** Add countdown timers to giveaways */
  addCountdownTimers: boolean;

  /** Filter giveaways by value */
  filterByValue: boolean;

  /** Minimum giveaway value to display */
  minimumValue: number;

  /** Notify when new giveaways are available */
  notifyNewGiveaways: boolean;
}

/**
 * Complete enhancer configuration
 */
export interface EnhancerConfig {
  /** Version of the config schema */
  schemaVersion: number;

  /** Global configuration */
  global: GlobalConfig;

  /** Item page configuration */
  itemPage: ItemPageConfig;

  /** Inventory page configuration */
  inventoryPage: InventoryPageConfig;

  /** Giveaways page configuration */
  giveawaysPage: GiveawaysPageConfig;
}
