import { applyAllEnhancements } from '@extension/shared';
import { useSimpleStorage } from '@extension/shared/lib/hooks/useStorage';
import { useEffect } from 'react';

// Definição de tipos para as mensagens e respostas
interface EnhancementMessage {
  action: 'reapplyEnhancements';
}

interface EnhancementResponse {
  success: boolean;
}

// Enhanced logging function (same as in index.ts)
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

export default function App() {
  const [isEnabled] = useSimpleStorage('enhancerEnabled', true);

  useEffect(() => {
    // Verifica se estamos na página mannco.store
    if (!window.location.href.includes('mannco.store')) {
      logEnhancer('App component loaded but not on mannco.store, skipping enhancements');
      return;
    }

    logEnhancer('App component loaded on mannco.store site', { url: window.location.href });

    // Configurar listener para mensagens do popup
    const messageListener = (
      message: EnhancementMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: EnhancementResponse) => void,
    ) => {
      if (message.action === 'reapplyEnhancements') {
        logEnhancer('Received reapply request from popup');

        try {
          applyEnhancements();
          sendResponse({ success: true });
          logEnhancer('Reapply enhancements completed successfully');
        } catch (error) {
          logEnhancer('Error when reapplying enhancements from popup request', error);
          sendResponse({ success: false });
        }
      }
      return true;
    };

    try {
      chrome.runtime.onMessage.addListener(messageListener);
      logEnhancer('Message listener registered successfully');
    } catch (error) {
      logEnhancer('Failed to register message listener', error);
    }

    // Aplicar melhorias se a extensão estiver ativada
    if (isEnabled) {
      logEnhancer('Extension is enabled, applying enhancements from App component');
      applyEnhancements();
    } else {
      logEnhancer('Extension is disabled, not applying enhancements from App component');
    }

    // Cleanup
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(messageListener);
        logEnhancer('Message listener removed during cleanup');
      } catch (error) {
        logEnhancer('Error removing message listener during cleanup', error);
      }
    };
  }, [isEnabled]);

  const applyEnhancements = () => {
    logEnhancer('Applying enhancements from App component');

    try {
      // Obter opções do storage
      chrome.storage.local.get(['enhancerOptions'], data => {
        try {
          const options = data.enhancerOptions || {
            improveUI: true,
            showExtraInfo: true,
            customFeatures: {
              calculateFees: true,
              highlightDeals: true,
            },
          };

          logEnhancer('Got options from storage, applying enhancements', options);

          // Aplicar melhorias usando as funções do pacote shared
          applyAllEnhancements(options);

          logEnhancer('Successfully applied all enhancements with options');
        } catch (optionsError) {
          logEnhancer('Error applying enhancements with options', optionsError);
        }
      });
    } catch (storageError) {
      logEnhancer('Error accessing storage for options', storageError);

      // Try to apply with default options as fallback
      try {
        logEnhancer('Applying enhancements with default options');
        applyAllEnhancements();
        logEnhancer('Successfully applied enhancements with default options');
      } catch (fallbackError) {
        logEnhancer(
          'Critical error: Failed to apply enhancements with default options',
          fallbackError,
        );
      }
    }
  };

  // Este componente não renderiza nada visualmente diretamente
  // Ele apenas manipula a página existente
  return null;
}
