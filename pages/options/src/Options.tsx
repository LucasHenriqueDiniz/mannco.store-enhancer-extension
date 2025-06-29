import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  EnhancerOptions,
  DEFAULT_OPTIONS,
  loadEnhancerOptions,
  saveEnhancerOptions,
} from '@extension/shared/src/config/enhancerOptions';
import { exampleThemeStorage } from '@extension/storage';
import '@src/Options.css';
import { useCallback, useEffect, useState } from 'react';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const [options, setOptions] = useState<EnhancerOptions>(DEFAULT_OPTIONS);
  const [activeTab, setActiveTab] = useState('general'); // general, item, inventory, giveaways
  const [isSaved, setIsSaved] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadOptions = async () => {
      const savedOptions = await loadEnhancerOptions();
      setOptions(savedOptions);
    };
    loadOptions();
  }, []);

  // Save all settings
  const saveSettings = useCallback(async () => {
    await saveEnhancerOptions(options);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Show saved message for 2 seconds
  }, [options]);

  // Update a specific option
  const updateOption = (section: keyof EnhancerOptions, key: string, value: any) => {
    setOptions(prevOptions => {
      const newOptions = { ...prevOptions };
      // @ts-ignore - Dynamic access to nested properties
      if (newOptions[section] && key in newOptions[section]) {
        // @ts-ignore - Dynamic access to nested properties
        newOptions[section][key] = value;
      }
      return newOptions;
    });
  };

  return (
    <div className={`app-container ${isLight ? 'light-theme' : 'dark-theme'}`}>
      <header className="options-header">
        <h1>Configurações do MannCo.Store Enhancer</h1>
        <button
          className="theme-toggle"
          onClick={exampleThemeStorage.toggle}
          aria-label={isLight ? 'Alternar para tema escuro' : 'Alternar para tema claro'}
        >
          {isLight ? '🌙 Tema Escuro' : '☀️ Tema Claro'}
        </button>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Geral
        </button>
        <button
          className={`tab ${activeTab === 'item' ? 'active' : ''}`}
          onClick={() => setActiveTab('item')}
        >
          Página de Item
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventário
        </button>
        <button
          className={`tab ${activeTab === 'giveaways' ? 'active' : ''}`}
          onClick={() => setActiveTab('giveaways')}
        >
          Sorteios
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'general' && (
          <div className="option-group">
            <h2>Configurações Gerais</h2>

            <div className="option-row">
              <label htmlFor="improveUI">Melhorias na Interface</label>
              <input
                type="checkbox"
                id="improveUI"
                checked={options.global.improveUI}
                onChange={e => updateOption('global', 'improveUI', e.target.checked)}
              />
              <span className="option-description">Aplica melhorias visuais em todo o site</span>
            </div>

            <div className="option-row">
              <label htmlFor="showExtraInfo">Mostrar Informações Extras</label>
              <input
                type="checkbox"
                id="showExtraInfo"
                checked={options.global.showExtraInfo}
                onChange={e => updateOption('global', 'showExtraInfo', e.target.checked)}
              />
              <span className="option-description">
                Exibe informações adicionais sobre itens e preços
              </span>
            </div>

            <div className="option-row">
              <label htmlFor="calculateFees">Calcular Taxas</label>
              <input
                type="checkbox"
                id="calculateFees"
                checked={options.features.calculateFees}
                onChange={e => updateOption('features', 'calculateFees', e.target.checked)}
              />
              <span className="option-description">
                Calcula automaticamente taxas e comissões nas transações
              </span>
            </div>

            <div className="option-row">
              <label htmlFor="highlightDeals">Destacar Ofertas</label>
              <input
                type="checkbox"
                id="highlightDeals"
                checked={options.features.highlightDeals}
                onChange={e => updateOption('features', 'highlightDeals', e.target.checked)}
              />
              <span className="option-description">
                Destaca visualmente as melhores ofertas disponíveis
              </span>
            </div>
          </div>
        )}

        {activeTab === 'item' && (
          <div className="option-group">
            <h2>Página de Item</h2>

            <div className="option-row">
              <label htmlFor="showMarketPrices">Mostrar Preços do Mercado</label>
              <input
                type="checkbox"
                id="showMarketPrices"
                checked={options.itemPage.showMarketPrices}
                onChange={e => updateOption('itemPage', 'showMarketPrices', e.target.checked)}
              />
              <span className="option-description">
                Exibe preços do mercado da Steam para comparação
              </span>
            </div>

            <div className="option-row">
              <label htmlFor="enhanceItemDescriptions">Melhorar Descrições</label>
              <input
                type="checkbox"
                id="enhanceItemDescriptions"
                checked={options.itemPage.enhanceItemDescriptions}
                onChange={e =>
                  updateOption('itemPage', 'enhanceItemDescriptions', e.target.checked)
                }
              />
              <span className="option-description">
                Aprimora as descrições dos itens com informações extras
              </span>
            </div>

            {/* Add more options from the centralized itemPage options */}
            <div className="option-row">
              <label htmlFor="createProfitTable">Tabela de Lucros</label>
              <input
                type="checkbox"
                id="createProfitTable"
                checked={options.itemPage.createProfitTable}
                onChange={e => updateOption('itemPage', 'createProfitTable', e.target.checked)}
              />
              <span className="option-description">
                Cria uma tabela com cálculos de lucro para diferentes preços
              </span>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="option-group">
            <h2>Página de Inventário</h2>

            <div className="option-row">
              <label htmlFor="highlightProfitItems">Destacar Itens Lucrativos</label>
              <input
                type="checkbox"
                id="highlightProfitItems"
                checked={options.inventoryPage.highlightProfitItems}
                onChange={e =>
                  updateOption('inventoryPage', 'highlightProfitItems', e.target.checked)
                }
              />
              <span className="option-description">
                Destaca automaticamente itens com potencial de lucro
              </span>
            </div>

            <div className="option-row">
              <label htmlFor="autoRefresh">Auto-Atualizar</label>
              <input
                type="checkbox"
                id="autoRefresh"
                checked={options.inventoryPage.autoRefresh}
                onChange={e => updateOption('inventoryPage', 'autoRefresh', e.target.checked)}
              />
              <span className="option-description">
                Atualiza automaticamente o inventário a cada minuto
              </span>
            </div>

            {/* Add more inventory page options */}
            <div className="option-row">
              <label htmlFor="addQuickUpdate">Atualização Rápida</label>
              <input
                type="checkbox"
                id="addQuickUpdate"
                checked={options.inventoryPage.addQuickUpdate}
                onChange={e => updateOption('inventoryPage', 'addQuickUpdate', e.target.checked)}
              />
              <span className="option-description">
                Adiciona botão para atualizar apenas os preços sem recarregar a página
              </span>
            </div>
          </div>
        )}

        {activeTab === 'giveaways' && (
          <div className="option-group">
            <h2>Página de Sorteios</h2>

            <div className="option-row">
              <label htmlFor="highlightLowEntries">Destacar Sorteios com Poucas Entradas</label>
              <input
                type="checkbox"
                id="highlightLowEntries"
                checked={options.giveawaysPage.highlightLowEntries}
                onChange={e =>
                  updateOption('giveawaysPage', 'highlightLowEntries', e.target.checked)
                }
              />
              <span className="option-description">
                Destaca sorteios com poucas participações (maior chance de ganhar)
              </span>
            </div>

            <div className="option-row">
              <label htmlFor="showEndTime">Mostrar Tempo Restante</label>
              <input
                type="checkbox"
                id="showEndTime"
                checked={options.giveawaysPage.showEndTime}
                onChange={e => updateOption('giveawaysPage', 'showEndTime', e.target.checked)}
              />
              <span className="option-description">
                Exibe o tempo restante para o fim do sorteio
              </span>
            </div>

            {/* Add more giveaways options */}
            <div className="option-row">
              <label htmlFor="addQuickJoinButton">Botão de Participação Rápida</label>
              <input
                type="checkbox"
                id="addQuickJoinButton"
                checked={options.giveawaysPage.addQuickJoinButton}
                onChange={e =>
                  updateOption('giveawaysPage', 'addQuickJoinButton', e.target.checked)
                }
              />
              <span className="option-description">
                Adiciona botão para participar de sorteios sem abrir a página
              </span>
            </div>
          </div>
        )}

        <div className="save-section">
          <button className="save-button" onClick={saveSettings}>
            Salvar Configurações
          </button>
          {isSaved && <span className="saved-message">✓ Configurações salvas!</span>}
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div>Carregando...</div>),
  <div>Ocorreu um erro</div>,
);
