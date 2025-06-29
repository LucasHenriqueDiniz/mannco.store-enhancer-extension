/**
 * Mannco.store Enhancer - Configuration Manager
 * Handles loading, saving, and managing configuration settings
 */

import type { EnhancerConfig } from './types';
import { defaultConfig } from './defaults';

const CONFIG_STORAGE_KEY = 'mannco-store-enhancer-config';

/**
 * Configuration Manager class
 * Handles loading, saving, and managing configuration settings
 */
export class ConfigManager {
  private config: EnhancerConfig;
  private initializing: Promise<void> | null = null;

  constructor() {
    this.config = { ...defaultConfig };
    this.initializing = this.loadConfig();
  }

  /**
   * Get the complete configuration
   * @returns The complete configuration object
   */
  async getConfig(): Promise<EnhancerConfig> {
    if (this.initializing) {
      await this.initializing;
    }
    return { ...this.config };
  }

  /**
   * Update the configuration
   * @param newConfig The new configuration object
   */
  async updateConfig(newConfig: Partial<EnhancerConfig>): Promise<void> {
    if (this.initializing) {
      await this.initializing;
    }

    // Merge the new configuration with the existing one
    this.config = {
      ...this.config,
      ...newConfig,
      // Handle nested objects
      global: { ...this.config.global, ...(newConfig.global || {}) },
      itemPage: { ...this.config.itemPage, ...(newConfig.itemPage || {}) },
      inventoryPage: { ...this.config.inventoryPage, ...(newConfig.inventoryPage || {}) },
      giveawaysPage: { ...this.config.giveawaysPage, ...(newConfig.giveawaysPage || {}) },
    };

    // Save the updated configuration
    await this.saveConfig();
  }

  /**
   * Reset the configuration to defaults
   */
  async resetConfig(): Promise<void> {
    this.config = { ...defaultConfig };
    await this.saveConfig();
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      // Check if we're in a browser environment (with chrome.storage)
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        return new Promise<void>(resolve => {
          chrome.storage.sync.get([CONFIG_STORAGE_KEY], result => {
            if (result && result[CONFIG_STORAGE_KEY]) {
              const storedConfig = result[CONFIG_STORAGE_KEY] as EnhancerConfig;

              // Check if we need to migrate the config (schema version mismatch)
              if (storedConfig.schemaVersion !== defaultConfig.schemaVersion) {
                this.migrateConfig(storedConfig);
              } else {
                this.config = storedConfig;
              }
            }
            resolve();
          });
        });
      }
      // Check if we're in a Node.js environment
      else if (typeof localStorage !== 'undefined') {
        const storedConfigString = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (storedConfigString) {
          const storedConfig = JSON.parse(storedConfigString) as EnhancerConfig;

          // Check if we need to migrate the config (schema version mismatch)
          if (storedConfig.schemaVersion !== defaultConfig.schemaVersion) {
            this.migrateConfig(storedConfig);
          } else {
            this.config = storedConfig;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Fall back to default config
      this.config = { ...defaultConfig };
    }

    this.initializing = null;
  }

  /**
   * Save configuration to storage
   */
  private async saveConfig(): Promise<void> {
    try {
      // Check if we're in a browser environment (with chrome.storage)
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        return new Promise<void>(resolve => {
          const data = { [CONFIG_STORAGE_KEY]: this.config };
          chrome.storage.sync.set(data, () => {
            resolve();
          });
        });
      }
      // Check if we're in a Node.js environment
      else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  /**
   * Migrate configuration from older versions
   * @param oldConfig The old configuration object
   */
  private migrateConfig(oldConfig: any): void {
    console.log(
      'Migrating configuration from version',
      oldConfig.schemaVersion,
      'to',
      defaultConfig.schemaVersion,
    );

    // Start with default config
    const newConfig = { ...defaultConfig };

    // For each section, copy over any existing properties
    if (oldConfig.global) {
      newConfig.global = { ...newConfig.global, ...oldConfig.global };
    }

    if (oldConfig.itemPage) {
      newConfig.itemPage = { ...newConfig.itemPage, ...oldConfig.itemPage };
    }

    if (oldConfig.inventoryPage) {
      newConfig.inventoryPage = { ...newConfig.inventoryPage, ...oldConfig.inventoryPage };
    }

    if (oldConfig.giveawaysPage) {
      newConfig.giveawaysPage = { ...newConfig.giveawaysPage, ...oldConfig.giveawaysPage };
    }

    // Update to the new version
    newConfig.schemaVersion = defaultConfig.schemaVersion;
    this.config = newConfig;
  }
}

// Export a singleton instance
export const configManager = new ConfigManager();
