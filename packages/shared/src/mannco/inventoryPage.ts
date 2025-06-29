/**
 * Funções para melhorar a página de inventário
 */

import { isOnPage, injectCSS, extractPriceValue } from './core.js';

/**
 * Interface para informações do item no inventário
 */
export interface InventoryItemInfo {
  name: string;
  id: string;
  quantity: number;
  game?: string;
  price?: string;
  url?: string;
  nbType?: string;
  image?: string;
}

/**
 * Processa a página de inventário - incluindo detecção de mudança de abas
 */
export function processInventoryPage(): void {
  if (!isOnPage('/inventory')) return;

  console.log('MannCo Enhancer: Processing inventory page');

  // Cria e injeta CSS
  injectInventoryStyles();

  // Configura o observador de mudança de abas
  setupTabChangeObserver();

  // Adiciona botões de destaque
  createHighlightButtons();
}

/**
 * Injeta estilos para a página de inventário
 */
function injectInventoryStyles(): void {
  const inventoryCSS = `
    .profitable-item {
      border: 2px solid #4CAF50 !important;
      border-radius: 5px !important;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5) !important;
      position: relative !important;
    }
    
    .profitable-item::after {
      content: attr(data-profit-margin);
      position: absolute;
      top: 0;
      right: 0;
      background: #4CAF50;
      color: white;
      padding: 2px 6px;
      border-radius: 0 5px 0 5px;
      font-size: 0.8rem;
      font-weight: bold;
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
    
    .highlight-btn:hover {
      background-color: #3e8e41;
    }
    
    /* Animação para items destacados */
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }
    
    .profitable-item {
      animation: pulse 2s infinite;
    }
    
    /* Melhoria visual para os contadores */
    .item-info span {
      display: inline-block;
      transition: all 0.2s ease;
    }
    
    .item-info span:hover {
      transform: translateY(-2px);
    }
  `;

  injectCSS(inventoryCSS, 'mannco-inventory-styles');
}

/**
 * Cria os botões de destaque para cada aba
 */
function createHighlightButtons(): void {
  // Espera até que as abas estejam disponíveis no DOM
  const waitForTabs = setInterval(() => {
    const onSaleTab = document.getElementById('tab-on-sale');
    const inventoryTab = document.getElementById('tab-site-inventory');

    if (onSaleTab && inventoryTab) {
      clearInterval(waitForTabs);

      // Cria botões para cada aba
      createHighlightButton('tab-on-sale', '#on-sale-items');
      createHighlightButton('tab-site-inventory', '#site-inventory-items');
    }
  }, 1000);

  // Para de verificar após 10 segundos
  setTimeout(() => clearInterval(waitForTabs), 10000);
}

/**
 * Cria um botão de destaque
 */
function createHighlightButton(
  tabId: string,
  itemsContainerSelector: string,
): HTMLButtonElement | null {
  const tab = document.getElementById(tabId);
  if (!tab) return null;

  const cardHead = tab.querySelector('.card-head');
  if (!cardHead) return null;

  // Verifica se o botão já existe
  const existingBtn = cardHead.querySelector(`#highlightProfitBtn-${tabId}`);
  if (existingBtn) return existingBtn as HTMLButtonElement;

  // Cria o botão
  const button = document.createElement('button');
  button.id = `highlightProfitBtn-${tabId}`;
  button.className = 'highlight-btn';
  button.textContent = '🔍 Destacar Lucros';

  // Adiciona evento de clique
  button.addEventListener('click', () => {
    const itemsContainer = document.querySelector(itemsContainerSelector);
    if (!itemsContainer) return;

    const count = highlightProfitableItems(itemsContainer);

    // Atualiza texto do botão temporariamente
    const originalText = button.textContent || '';
    button.textContent = `🔍 Destacar Lucros (${count})`;
    setTimeout(() => {
      button.textContent = originalText;
    }, 3000);

    console.log(`MannCo Enhancer: Highlighted ${count} profitable items in ${tabId}`);
  });

  // Adiciona o botão à UI
  const h3 = cardHead.querySelector('h3');
  if (h3) {
    h3.appendChild(button);
  } else {
    cardHead.appendChild(button);
  }

  return button;
}

/**
 * Destaca itens lucrativos na lista
 */
function highlightProfitableItems(itemsContainer: Element): number {
  const items = itemsContainer.querySelectorAll('li');
  let count = 0;

  items.forEach(item => {
    // Limpa destacamento anterior
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
          item.setAttribute('data-profit-margin', `${(profitMargin * 100).toFixed(0)}%`);
          count++;
        }
      }
    }
  });

  return count;
}

/**
 * Configura observador de mudança de abas
 */
function setupTabChangeObserver(): void {
  const tabs = document.querySelectorAll('[role="tab"]');

  // Cria observador para mudanças de abas
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

  // Observa cada aba
  tabs.forEach(tab => {
    observer.observe(tab, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });
}

/**
 * Extrai informações de um item
 */
export function extractItemInfo(itemElement: Element): InventoryItemInfo {
  if (!itemElement) return { name: '', id: '', quantity: 0 };

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
