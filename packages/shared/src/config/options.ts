/**
 * Mannco.store Enhancer - Configurações centralizadas
 * @deprecated Use enhancerOptions.ts instead
 */

import {
  DEFAULT_OPTIONS,
  EnhancerOptions,
  loadEnhancerOptions,
  saveEnhancerOptions,
} from './enhancerOptions';

// Re-export for backward compatibility
export { EnhancerOptions, DEFAULT_OPTIONS, loadEnhancerOptions, saveEnhancerOptions };

/**
 * Interface para informações do usuário
 */
export interface UserInfo {
  balance: number;
  balanceCurrency: string;
  username: string;
}

/**
 * Função auxiliar para extrair informações do usuário
 */
export function getUserInfo(): UserInfo | null {
  try {
    // Extrai saldo do usuário
    const balanceElement = document.querySelector(
      '#account-dropdown > div > span.account-balance.ecurrency',
    );
    let balance = 0;
    let balanceCurrency = '';

    if (balanceElement) {
      const balanceText = balanceElement.textContent?.trim() || '';

      // Extrai valor numérico e moeda
      const currencyMatch = balanceText.match(/[$€£R\u20AC\u00A3]|HK\$/);
      balanceCurrency = currencyMatch ? currencyMatch[0] : '$';

      // Extrai valor numérico
      const valueMatch = balanceText.replace(/[~\s]/g, '').match(/[\d.,]+/);
      if (valueMatch) {
        balance = parseFloat(valueMatch[0].replace(',', '.'));
      }
    }

    // Extrai nome de usuário
    const usernameElement = document.querySelector(
      '#account-dropdown > div > span.account-username',
    );
    const username = usernameElement?.textContent?.trim() || 'Unknown User';

    return {
      balance,
      balanceCurrency,
      username,
    };
  } catch (error) {
    console.error('Erro ao extrair informações do usuário:', error);
    return null;
  }
}
