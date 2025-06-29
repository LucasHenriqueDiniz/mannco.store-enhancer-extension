/**
 * Mannco.store Enhancer - Funções e tipos compartilhados
 */

import { EnhancerOptions } from '../config/enhancerOptions';

/**
 * Verifica se estamos em uma página específica do mannco.store
 */
export function isOnPage(path: string): boolean {
  // Lida com traduções como /ru/giveaways verificando se a URL contém o caminho
  return (
    window.location.href.includes(`mannco.store${path}`) ||
    window.location.href.match(new RegExp(`mannco\\.store/\\w+${path.replace(/\//g, '\\/')}$`)) !==
      null
  );
}

/**
 * Remove o alerta global em todas as páginas
 */
export function removeGlobalAlert(): void {
  const globalAlert = document.querySelector('#content > div.global-alert.my-4.rounded-2');
  if (globalAlert) {
    console.log('MannCo Enhancer: Removing global alert');
    globalAlert.remove();
  }
}

/**
 * Cria e injeta CSS na página
 */
export function injectCSS(cssContent: string, id: string): void {
  // Remove o estilo existente se houver
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Cria e injeta o novo estilo
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssContent;
  document.head.appendChild(style);
}

/**
 * Extrai valor numérico de texto de preço
 */
export function extractPriceValue(priceText: string | null): number {
  if (!priceText) return 0;
  const numericValue = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
}

/**
 * Aplica melhorias na interface do usuário
 */
export function enhanceUI(): void {
  console.log('Melhorando a interface do mannco.store...');

  // Exemplo: melhorar o contraste de elementos importantes
  const itemCards = document.querySelectorAll('.item-card');
  itemCards.forEach(() => {
    // Implementação futura de melhorias visuais
    // TODO: Implementar melhorias para cada card
  });
}

/**
 * Adiciona informações extras aos itens
 */
export function addExtraItemInfo(): void {
  console.log('Adicionando informações extras aos itens...');

  // Exemplo: adicionar informações de preços do mercado
  const priceElements = document.querySelectorAll('.item-price');
  priceElements.forEach(() => {
    // Implementação futura para adicionar informações extras
    // TODO: Implementar adição de informações para cada elemento
  });
}

/**
 * Calcula taxas e mostra o valor final
 */
export function calculateFees(): void {
  console.log('Calculando taxas e valores finais...');

  // Implementar cálculo de taxas
}

/**
 * Destaca ofertas especiais
 */
export function highlightDeals(): void {
  console.log('Destacando ofertas especiais...');

  // Implementar destaque para boas ofertas
}
