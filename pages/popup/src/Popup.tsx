import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import '@src/Popup.css';
import { useEffect, useState } from 'react';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const [isEnabled, setIsEnabled] = useState(true);
  const [siteStatus, setSiteStatus] = useState({ isOnMannco: false, url: '' });

  // Carregar configurações salvas e verificar site atual
  useEffect(() => {
    // Carregar o estado da extensão
    chrome.storage.local.get(['enhancerEnabled'], data => {
      if (data.enhancerEnabled !== undefined) {
        setIsEnabled(data.enhancerEnabled);
      }
    });

    // Verificar se estamos em uma página mannco.store
    // Usando chrome.tabs.query com activeTab (não requer permissão "tabs" explícita)
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentUrl = tabs[0]?.url || '';
        const isOnMannco = currentUrl.includes('mannco.store');
        setSiteStatus({ isOnMannco, url: currentUrl });
      });
    } catch (error) {
      console.error('Erro ao verificar a URL atual:', error);
      setSiteStatus({ isOnMannco: false, url: '' });
    }
  }, []);

  // Alternar estado da extensão
  const toggleEnabled = () => {
    const newState = !isEnabled;

    // Atualizar o estado no storage e notificar o background script
    chrome.runtime.sendMessage(
      {
        action: 'setEnabled',
        enabled: newState,
      },
      () => {
        // Depois que o background atualizar o ícone, atualizamos o estado local
        setIsEnabled(newState);

        // Se estivermos em uma página mannco.store, aplicar mudanças imediatamente
        if (siteStatus.isOnMannco) {
          reapplyEnhancements();
        }
      },
    );
  };

  // Injetar script de conteúdo em uma aba ativa
  const reapplyEnhancements = async () => {
    // Usando o activeTab (não requer permissão "tabs" explícita)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.id && tab.url && tab.url.includes('mannco.store')) {
        chrome.tabs.sendMessage(tab.id, { action: 'reapplyEnhancements' }, response => {
          console.log('Enhancements reapplied:', response);
        });
      }
    } catch (error) {
      console.error('Erro ao reaplicar melhorias:', error);
    }
  };

  // Abrir a página de configurações
  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/index.html'));
    }
  };

  // Abrir página de doação
  const openDonationPage = () => {
    // Usando a API chrome.tabs só para criar uma nova aba (funciona com activeTab)
    chrome.tabs.create({ url: 'https://www.buymeacoffee.com/seuusername' });
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <div className={`App-content ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <h2 className="text-2xl font-bold mb-4">MannCo.Store Enhancer</h2>

        {/* Grande switch de ligar/desligar */}
        <div className="toggle-container mb-6">
          <button
            className={`big-toggle ${isEnabled ? 'enabled' : 'disabled'}`}
            onClick={toggleEnabled}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleEnabled();
              }
            }}
            role="switch"
            aria-checked={isEnabled}
            tabIndex={0}
          >
            <div className="toggle-track">
              <div className="toggle-indicator">
                {/* Usando apenas texto OFF/ON em vez de ícones */}
                <span className="toggle-status-text">{isEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Status do site */}
        <div className="site-status mb-4">
          <span
            className={`status-indicator ${siteStatus.isOnMannco ? 'active' : 'inactive'}`}
          ></span>
          <span>{siteStatus.isOnMannco ? 'mannco.store' : 'Não está no mannco.store'}</span>
        </div>

        {/* Botões de ação */}
        <div className="action-buttons">
          <button
            onClick={reapplyEnhancements}
            disabled={!isEnabled || !siteStatus.isOnMannco}
            className={`action-btn ${isEnabled && siteStatus.isOnMannco ? 'active' : 'disabled'}`}
            title={!siteStatus.isOnMannco ? 'Disponível apenas no mannco.store' : ''}
          >
            Aplicar
          </button>

          <button onClick={openOptionsPage} className="action-btn config">
            Configurações
          </button>

          <button onClick={openDonationPage} className="action-btn donate">
            Doar
          </button>
        </div>

        <div className="version-info">
          <span>v{chrome.runtime.getManifest().version}</span>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error</div>);
