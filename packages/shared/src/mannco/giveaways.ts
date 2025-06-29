/**
 * Funções de melhoria para a página de giveaways do MannCo.Store
 */

import { isOnPage } from './core.js';

/**
 * Interface para informações de giveaway
 */
export interface GiveawayInfo {
  title: string;
  timeLeft?: string;
  entrants?: number;
  element: Element;
}

/**
 * Processa a página de giveaways
 */
export function processGiveaways(): void {
  if (!isOnPage('/giveaways')) return;

  console.log('MannCo Enhancer: Processing giveaways page');

  const giveaways = document.querySelectorAll(
    '#main > div > div.raffle-list.list-group.rfl > a.raffle-list__item.list-group-item.list-group-item-action.is-official.raffleitem.isv',
  );

  // Lista todos os giveaways encontrados
  const giveawaysList: GiveawayInfo[] = [];

  giveaways.forEach((giveaway, index) => {
    const title = giveaway.querySelector('.raffle-list__title')?.textContent?.trim() || 'Unknown';
    const timeElement = giveaway.querySelector('.raffle-list__time');
    const entrantsElement = giveaway.querySelector('.raffle-list__participants');

    const info: GiveawayInfo = {
      title: title,
      element: giveaway,
    };

    if (timeElement) {
      info.timeLeft = timeElement.textContent?.trim();
    }

    if (entrantsElement) {
      const entrantsText = entrantsElement.textContent?.trim();
      if (entrantsText) {
        const match = entrantsText.match(/\d+/);
        if (match) {
          info.entrants = parseInt(match[0], 10);
        }
      }
    }

    giveawaysList.push(info);

    console.log(`MannCo Enhancer Giveaway ${index + 1}:`, info);
  });

  // Destaca giveaways com poucos participantes
  highlightLowEntryGiveaways(giveawaysList);
}

/**
 * Destaca giveaways com poucos participantes
 */
function highlightLowEntryGiveaways(giveaways: GiveawayInfo[]): void {
  giveaways.forEach(giveaway => {
    if (giveaway.entrants && giveaway.entrants < 100) {
      // Destaca giveaways com menos de 100 participantes
      (giveaway.element as HTMLElement).style.border = '2px solid #ff9800';
      (giveaway.element as HTMLElement).style.backgroundColor = 'rgba(255, 152, 0, 0.1)';

      // Adiciona um indicador visual
      const badge = document.createElement('span');
      badge.textContent = '🔥 Low Entries!';
      badge.style.position = 'absolute';
      badge.style.top = '5px';
      badge.style.right = '5px';
      badge.style.backgroundColor = '#ff9800';
      badge.style.color = 'white';
      badge.style.padding = '2px 6px';
      badge.style.borderRadius = '3px';
      badge.style.fontSize = '12px';
      badge.style.fontWeight = 'bold';

      giveaway.element.appendChild(badge);
    }
  });
}

/**
 * Melhoria visual para página de giveaways
 */
export function enhanceGiveawaysPage(): void {
  if (!isOnPage('/giveaways')) return;

  // Adiciona estilos personalizados para a página de giveaways
  const giveawaysCSS = `
    .raffle-list__item {
      transition: transform 0.2s ease;
      position: relative;
    }
    
    .raffle-list__item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .raffle-list__title {
      font-weight: bold !important;
      font-size: 1.1em !important;
    }
    
    .raffle-list__item.is-official {
      border-left: 4px solid #4CAF50 !important;
    }
  `;

  // Injeta CSS personalizado para página de giveaways
  const styleElement = document.createElement('style');
  styleElement.textContent = giveawaysCSS;
  document.head.appendChild(styleElement);
}
