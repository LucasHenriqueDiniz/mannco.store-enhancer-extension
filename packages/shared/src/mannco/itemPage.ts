/**
 * Funções para melhorar a página de detalhes de um item específico
 */
import { isOnPage, injectCSS } from '../utils/dom.js';
import type { ItemPageConfig } from '../config/types.js';

interface ItemData {
  name: string;
  price: number;
  steamPrice?: number;
  skin?: string;
  wear?: string;
  type?: string;
  game?: string;
}

/**
 * Extrai dados do item da página
 */
function extractItemData(): ItemData {
  const data: ItemData = {
    name: document.querySelector('.item-name')?.textContent?.trim() || 'Unknown Item',
    price: 0,
  };

  // Extrair preço atual
  const priceElement = document.querySelector('.item-price-current');
  if (priceElement) {
    const priceText = priceElement.textContent?.trim();
    if (priceText) {
      const match = priceText.match(/[\d.,]+/);
      if (match) {
        data.price = parseFloat(match[0].replace(',', '.'));
      }
    }
  }

  // Extrair preço da Steam, se disponível
  const steamPriceElement = document.querySelector('.item-highest-sprice span');
  if (steamPriceElement) {
    const priceText = steamPriceElement.textContent?.trim();
    if (priceText) {
      const match = priceText.match(/[\d.,]+/);
      if (match) {
        data.steamPrice = parseFloat(match[0].replace(',', '.'));
      }
    }
  }

  // Extrair informações adicionais (tipo, desgaste, etc.)
  const detailElements = document.querySelectorAll('.item-details .item-detail');
  detailElements.forEach(element => {
    const label = element.querySelector('.item-detail__label')?.textContent?.trim();
    const value = element.querySelector('.item-detail__value')?.textContent?.trim();
    if (label && value) {
      if (label.includes('Type')) {
        data.type = value;
      } else if (label.includes('Skin')) {
        data.skin = value;
      } else if (label.includes('Wear')) {
        data.wear = value;
      } else if (label.includes('Game')) {
        data.game = value;
      }
    }
  });

  return data;
}

/**
 * Melhora a página de detalhes do item
 */
export function enhanceItemPage(config: ItemPageConfig): void {
  if (!isOnPage('/item/')) return;
  console.log('MannCo Enhancer: Enhancing item page');

  // Extrai dados do item
  const itemData = extractItemData();
  console.log('Item data:', itemData);

  // Modificações baseadas na configuração
  if (config.removeBreadcrumbs) {
    removeBreadcrumbs();
  }

  // Aplica estilização ao container principal do item
  const itemContainer = document.querySelector('#content > div:nth-child(3)');
  if (itemContainer) {
    // Modifica estilos
    (itemContainer as HTMLElement).classList.add('mannco-enhanced-container');
    // Adiciona classe para facilitar estilização via CSS
    itemContainer.classList.add('mannco-enhanced-item-container');
  }

  // Adiciona cálculo de diferença de preço, se disponível
  if (
    config.showPriceComparisons &&
    itemData.price &&
    itemData.steamPrice &&
    itemData.steamPrice > 0
  ) {
    addPriceDifferenceIndicator(itemData);
  }

  // Movimenta o histórico de vendas, se configurado
  if (config.moveSalesHistory) {
    moveSalesHistory();
  }

  // Torna o histórico de vendas colapsável, se configurado
  if (config.collapsableSalesHistory) {
    makeHistoryCollapsable();
  }

  // Adiciona botão de igualar preço, se configurado
  if (config.addMatchButton) {
    addMatchButton();
  }

  // Cria tabela de lucro, se configurado
  if (config.createProfitTable) {
    createProfitTable(itemData);
  }

  // Adiciona estilos personalizados para a página
  injectCustomItemPageStyles();
}

/**
 * Remove as breadcrumbs da página
 */
function removeBreadcrumbs(): void {
  const breadcrumbs = document.querySelector('.breadcrumb');
  if (breadcrumbs) {
    breadcrumbs.remove();
    console.log('MannCo Enhancer: Removed breadcrumbs from item page');
  }
}

/**
 * Movimenta o histórico de vendas para uma posição mais conveniente
 */
function moveSalesHistory(): void {
  const salesHistory = document.querySelector('.item-sales-history');
  const itemContainer = document.querySelector('.item-container');

  if (salesHistory && itemContainer) {
    // Cria um novo container para o histórico
    const historyContainer = document.createElement('div');
    historyContainer.className = 'mannco-sales-history-container';
    historyContainer.appendChild(salesHistory);

    // Adiciona após o container do item
    itemContainer.parentNode?.insertBefore(historyContainer, itemContainer.nextSibling);

    console.log('MannCo Enhancer: Moved sales history');
  }
}

/**
 * Torna o histórico de vendas colapsável
 */
function makeHistoryCollapsable(): void {
  const salesHistory = document.querySelector('.item-sales-history');
  if (!salesHistory) return;

  // Cria botão de toggle
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Ocultar Histórico';
  toggleButton.className = 'mannco-toggle-history-btn';

  // Adiciona estilo ao botão
  Object.assign(toggleButton.style, {
    padding: '5px 10px',
    margin: '10px 0',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  });

  // Insere o botão antes do histórico
  salesHistory.parentNode?.insertBefore(toggleButton, salesHistory);

  // Adiciona evento de clique
  let isHidden = false;
  toggleButton.addEventListener('click', () => {
    isHidden = !isHidden;

    if (isHidden) {
      salesHistory.style.display = 'none';
      toggleButton.textContent = 'Mostrar Histórico';
    } else {
      salesHistory.style.display = '';
      toggleButton.textContent = 'Ocultar Histórico';
    }
  });

  console.log('MannCo Enhancer: Made sales history collapsable');
}

/**
 * Adiciona botão para igualar preço
 */
function addMatchButton(): void {
  const priceInputContainer = document.querySelector('.item-price-block');
  if (!priceInputContainer) return;

  // Busca pelo preço mais baixo atual
  const lowestPriceElement = document.querySelector('.item-lowest-price span');
  if (!lowestPriceElement) return;

  const lowestPriceText = lowestPriceElement.textContent;
  if (!lowestPriceText) return;

  // Extrai o valor numérico
  const match = lowestPriceText.match(/[\d.,]+/);
  if (!match) return;

  const lowestPrice = parseFloat(match[0].replace(',', '.'));

  // Cria o botão
  const matchButton = document.createElement('button');
  matchButton.textContent = 'Igualar Preço';
  matchButton.className = 'mannco-match-price-btn';

  // Adiciona estilo ao botão
  Object.assign(matchButton.style, {
    padding: '5px 10px',
    margin: '10px 0',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'block',
  });

  // Adiciona evento de clique
  matchButton.addEventListener('click', () => {
    const priceInput = document.querySelector('.item-price-input') as HTMLInputElement;
    if (priceInput) {
      priceInput.value = lowestPrice.toString();
      // Dispara um evento de input para ativar qualquer validação
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log(`MannCo Enhancer: Set price to match lowest: ${lowestPrice}`);
    }
  });

  // Adiciona o botão à página
  priceInputContainer.appendChild(matchButton);
  console.log('MannCo Enhancer: Added match price button');
}

/**
 * Cria uma tabela de lucro estimado
 */
function createProfitTable(itemData: ItemData): void {
  if (!itemData.price || !itemData.steamPrice) return;

  const infoSection = document.querySelector('.item-info');
  if (!infoSection) return;

  // Cria o container da tabela
  const tableContainer = document.createElement('div');
  tableContainer.className = 'mannco-profit-table-container';

  // Estiliza o container
  Object.assign(tableContainer.style, {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '5px',
    border: '1px solid #4CAF50',
  });

  // Calcula valores importantes
  const manncoFee = itemData.price * 0.1; // 10% de taxa do MannCo.Store
  const steamFee = itemData.steamPrice * 0.15; // 15% de taxa da Steam
  const manncoProfit = itemData.price - manncoFee;
  const steamProfit = itemData.steamPrice - steamFee;
  const difference = steamProfit - manncoProfit;
  const percentDiff = (difference / steamProfit) * 100;

  // Cria conteúdo HTML da tabela
  tableContainer.innerHTML = `
    <h4 style="margin-top: 0; color: #4CAF50;">Análise de Lucro</h4>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Plataforma</th>
        <th style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">Preço</th>
        <th style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">Taxa</th>
        <th style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">Lucro</th>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">MannCo.Store</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${itemData.price.toFixed(2)}</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${manncoFee.toFixed(2)}</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${manncoProfit.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">Steam</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${itemData.steamPrice.toFixed(2)}</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${steamFee.toFixed(2)}</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">$${steamProfit.toFixed(2)}</td>
      </tr>
    </table>
    <div style="margin-top: 10px; font-weight: bold; color: ${difference > 0 ? '#4CAF50' : '#F44336'};">
      Diferença de lucro: $${difference.toFixed(2)} (${percentDiff.toFixed(2)}%)
    </div>
    <div style="font-size: 12px; margin-top: 5px; color: #757575;">
      * Taxas estimadas: MannCo.Store 10%, Steam 15%
    </div>
  `;

  // Adiciona a tabela à página
  infoSection.appendChild(tableContainer);
  console.log('MannCo Enhancer: Added profit analysis table');
}

/**
 * Adiciona indicador de diferença de preço
 */
function addPriceDifferenceIndicator(itemData: ItemData): void {
  if (!itemData.steamPrice || !itemData.price) return;

  const priceDifference = itemData.steamPrice - itemData.price;
  const percentageDifference = (priceDifference / itemData.steamPrice) * 100;

  const priceInfoContainer = document.querySelector('.item-price-block');
  if (!priceInfoContainer) return;

  const differenceElement = document.createElement('div');
  differenceElement.className = 'mannco-price-difference';

  // Determine a cor baseada na diferença (verde se for uma boa oferta)
  const isGoodDeal = percentageDifference > 10; // 10% mais barato que na Steam
  const differenceColor = isGoodDeal ? '#4CAF50' : '#757575';

  differenceElement.innerHTML = `
    <div style="margin-top: 10px; padding: 8px; border-radius: 4px; background-color: ${isGoodDeal ? 'rgba(76, 175, 80, 0.1)' : 'transparent'};">
      <div style="font-weight: bold; color: ${differenceColor};">
        Diferença Steam: ${priceDifference.toFixed(2)}$ (${percentageDifference.toFixed(2)}%)
      </div>
      ${
        isGoodDeal
          ? `<div style="font-size: 12px; color: #4CAF50;">Boa oferta! Significativamente mais barato que na Steam.</div>`
          : ''
      }
    </div>
  `;

  priceInfoContainer.appendChild(differenceElement);
}

/**
 * Injeta estilos personalizados para a página de item
 */
function injectCustomItemPageStyles(): void {
  const itemPageStyles = `
    .mannco-enhanced-item-container {
      border: 2px solid #4CAF50 !important;
      border-radius: 8px !important;
      padding: 15px !important;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.4) !important;
      transition: all 0.3s ease !important;
    }
    
    .mannco-enhanced-item-container:hover {
      box-shadow: 0 0 15px rgba(76, 175, 80, 0.6) !important;
    }
    
    .mannco-price-difference {
      margin-top: 10px;
      animation: fadeIn 0.5s ease;
    }
    
    .mannco-toggle-history-btn:hover,
    .mannco-match-price-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .mannco-sales-history-container {
      margin-top: 15px;
      border-radius: 5px;
      padding: 10px;
      background-color: rgba(200, 200, 200, 0.1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  injectCSS(itemPageStyles, 'mannco-item-page-styles');
}
