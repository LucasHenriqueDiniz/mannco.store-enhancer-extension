import 'webextension-polyfill';
import { storage, exampleThemeStorage } from '@extension/storage';

// Define interface for enhancer options
interface EnhancerOptions {
  improveUI?: boolean;
  showExtraInfo?: boolean;
  customFeatures?: {
    calculateFees?: boolean;
    highlightDeals?: boolean;
  };
  // Adicionamos configurações específicas de páginas
  itemPage?: {
    showMarketPrices?: boolean;
    enhanceItemDescriptions?: boolean;
  };
  inventoryPage?: {
    highlightProfitItems?: boolean;
    autoRefresh?: boolean;
  };
  giveawaysPage?: {
    highlightLowEntries?: boolean;
    showEndTime?: boolean;
  };
}

// Create a consistent logging system for the background script
function logBackground(message: string, data?: unknown) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // Just time HH:MM:SS
  const prefix = `[Enhancer BG ${timestamp}]`;

  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

// Store a limited number of logs in memory to help with debugging
const MAX_LOG_ENTRIES = 50;
type LogEntry = {
  timestamp: string;
  source: string;
  message: string;
  data?: unknown;
};
const logHistory: LogEntry[] = [];

// Add log to in-memory history with rotation
function addLogEntry(source: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();

  // Add new log entry
  logHistory.push({ timestamp, source, message, data });

  // Keep only the latest MAX_LOG_ENTRIES
  if (logHistory.length > MAX_LOG_ENTRIES) {
    logHistory.shift();
  }
}

// Atualizar o ícone com base no estado da extensão - agora usando badge text em vez de ícone alternativo
function updateIcon(isEnabled: boolean) {
  if (chrome.action) {
    // Sempre usar o mesmo ícone
    chrome.action.setIcon({
      path: 'icon-34.png',
    });

    // Quando desativado, mostrar um texto "OFF" no badge
    if (!isEnabled) {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
    } else {
      chrome.action.setBadgeText({ text: '' }); // Sem texto quando ativado
    }

    logBackground(`Icon updated with ${isEnabled ? 'active state' : '"OFF" badge'}`);
  }
}

logBackground('Background script loaded - MannCo.Store Enhancer');

// Verificar disponibilidade das APIs
const hasNotifications = chrome.notifications !== undefined;
const hasAlarms = chrome.alarms !== undefined;

// Configuração inicial ao instalar
chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    logBackground('Extension installed for the first time');

    // Definir configurações padrão
    await storage.local.set({
      enhancerEnabled: true,
      enhancerOptions: {
        improveUI: true,
        showExtraInfo: true,
        customFeatures: {
          calculateFees: true,
          highlightDeals: true,
        },
        // Adicionamos configurações específicas de páginas com valores padrão
        itemPage: {
          showMarketPrices: true,
          enhanceItemDescriptions: true,
        },
        inventoryPage: {
          highlightProfitItems: true,
          autoRefresh: false,
        },
        giveawaysPage: {
          highlightLowEntries: true,
          showEndTime: true,
        },
      },
    });

    // Garantir que o ícone esteja correto
    updateIcon(true);

    // Mostrar uma mensagem de boas-vindas apenas se a API de notificações estiver disponível
    if (hasNotifications) {
      try {
        chrome.notifications.create('welcome', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon-128.png'),
          title: 'MannCo.Store Enhancer',
          message: 'Extensão instalada com sucesso! Visite mannco.store para ver as melhorias.',
        });
      } catch (err) {
        logBackground('Failed to create notification:', err);
      }
    } else {
      logBackground('Notifications API not available');
    }
  } else if (details.reason === 'update') {
    logBackground(
      `Extension updated from ${details.previousVersion} to ${chrome.runtime.getManifest().version}`,
    );

    // Manter configurações existentes, mas garantir que novos recursos sejam inicializados
    const data = await storage.local.get(['enhancerEnabled', 'enhancerOptions']);

    // Definir o ícone correto com base nas configurações salvas
    if (data.enhancerEnabled !== undefined) {
      updateIcon(data.enhancerEnabled);
    }

    if (data.enhancerOptions) {
      // Garantir que todas as opções estejam presentes
      const updatedOptions = {
        ...data.enhancerOptions,
        customFeatures: {
          calculateFees: data.enhancerOptions.customFeatures?.calculateFees ?? true,
          highlightDeals: data.enhancerOptions.customFeatures?.highlightDeals ?? true,
        },
        // Garantir que as novas configurações específicas de páginas estejam presentes
        itemPage: {
          showMarketPrices: data.enhancerOptions.itemPage?.showMarketPrices ?? true,
          enhanceItemDescriptions: data.enhancerOptions.itemPage?.enhanceItemDescriptions ?? true,
        },
        inventoryPage: {
          highlightProfitItems: data.enhancerOptions.inventoryPage?.highlightProfitItems ?? true,
          autoRefresh: data.enhancerOptions.inventoryPage?.autoRefresh ?? false,
        },
        giveawaysPage: {
          highlightLowEntries: data.enhancerOptions.giveawaysPage?.highlightLowEntries ?? true,
          showEndTime: data.enhancerOptions.giveawaysPage?.showEndTime ?? true,
        },
      };

      await storage.local.set({
        enhancerOptions: updatedOptions,
      });

      logBackground('Updated options:', updatedOptions);
    }
  }
});

// Responder a mensagens do content script ou popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tab = sender.tab;
  const url = tab?.url || 'unknown';
  const tabId = tab?.id || 'unknown';

  // Handle log messages specially
  if (message.action === 'logInfo') {
    const logData = message.data || {};
    const source = `Content(${tabId})`;

    // Add to our log history
    addLogEntry(source, logData.message || 'No message', logData);

    // Print to console with more context
    logBackground(`Log from ${url.substring(0, 50)}...`, logData);

    sendResponse({ received: true, timestamp: new Date().toISOString() });
    return true;
  }

  // For other messages, log them and handle normally
  logBackground(`Received ${message.action} message from tab ${tabId}`, { message, url });

  if (message.action === 'getStatus') {
    storage.local
      .get<{ enhancerEnabled?: boolean }>('enhancerEnabled')
      .then(data => {
        const enabled = data.enhancerEnabled ?? true;
        logBackground(`Sending status to tab ${tabId}:`, { enabled });
        sendResponse({ enabled });
      })
      .catch((err: Error) => {
        logBackground(`Error getting status for tab ${tabId}:`, err);
        sendResponse({ enabled: true, error: err.message });
      });

    return true; // Indica que a resposta será assíncrona
  }

  if (message.action === 'getOptions') {
    storage.local
      .get<{ enhancerOptions?: EnhancerOptions }>('enhancerOptions')
      .then(data => {
        logBackground(`Sending options to tab ${tabId}:`, data.enhancerOptions);
        sendResponse({ options: data.enhancerOptions });
      })
      .catch((err: Error) => {
        logBackground(`Error getting options for tab ${tabId}:`, err);
        sendResponse({ error: err.message });
      });

    return true; // Indica que a resposta será assíncrona
  }

  // Tratar alterações no estado da extensão (ligado/desligado)
  if (message.action === 'setEnabled') {
    const isEnabled = message.enabled;

    storage.local
      .set({ enhancerEnabled: isEnabled })
      .then(() => {
        updateIcon(isEnabled);
        logBackground(`Extension ${isEnabled ? 'enabled' : 'disabled'}`);
        sendResponse({ success: true });
      })
      .catch((err: Error) => {
        logBackground(`Error setting enabled state:`, err);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }

  // Provide a way to retrieve logs for debugging
  if (message.action === 'getLogs') {
    sendResponse({ logs: logHistory });
    return true;
  }

  return false; // Needed to fix the "Not all code paths return a value" warning
});

// Definir um alarme para verificação periódica apenas se a API estiver disponível
if (hasAlarms) {
  try {
    chrome.alarms.create('checkSettings', { periodInMinutes: 60 });
    chrome.alarms.onAlarm.addListener(alarm => {
      if (alarm.name === 'checkSettings') {
        logBackground('Checking for settings changes...');
        // Implementar verificação de configurações se necessário
      }
    });
  } catch (err) {
    logBackground('Failed to create alarm:', err);
  }
} else {
  logBackground('Alarms API not available');
}

// Verificar o estado inicial da extensão e configurar o ícone apropriado
storage.local.get(['enhancerEnabled']).then(data => {
  const isEnabled = data.enhancerEnabled !== undefined ? data.enhancerEnabled : true;
  updateIcon(isEnabled);
  logBackground(`Initial extension state: ${isEnabled ? 'enabled' : 'disabled'}`);
});

// Check if the extension is running properly
exampleThemeStorage.get().then((theme: string) => {
  logBackground('Current theme:', theme);
});

logBackground('MannCo.Store Enhancer background script initialized');

export {};
