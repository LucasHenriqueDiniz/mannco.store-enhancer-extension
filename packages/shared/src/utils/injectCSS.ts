/**
 * Utilitário para injetar CSS na página
 */

/**
 * Injetar CSS na página com um ID específico
 * @param cssContent O conteúdo CSS a ser injetado
 * @param id ID único para o elemento de estilo
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
 * Cria um elemento de script e o adiciona à página
 * @param scriptContent Conteúdo JavaScript a ser executado
 * @param id ID único para o script
 */
export function injectScript(scriptContent: string, id: string): void {
  // Remove o script existente se houver
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Cria e injeta o novo script
  const script = document.createElement('script');
  script.id = id;
  script.textContent = scriptContent;
  document.head.appendChild(script);
}

/**
 * Adiciona um botão de scroll para o topo na página
 */
export function addScrollToTopButton(): void {
  // Verifica se o botão já existe
  if (document.getElementById('mannco-scroll-top-btn')) return;

  // Cria o CSS para o botão
  const scrollBtnCSS = `
    #mannco-scroll-top-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 9999;
    }
    
    #mannco-scroll-top-btn.visible {
      opacity: 0.8;
    }
    
    #mannco-scroll-top-btn:hover {
      opacity: 1;
      transform: translateY(-3px);
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
  `;

  // Injeta o CSS
  injectCSS(scrollBtnCSS, 'mannco-scroll-top-styles');

  // Cria o botão
  const scrollBtn = document.createElement('button');
  scrollBtn.id = 'mannco-scroll-top-btn';
  scrollBtn.innerHTML = '&#8679;';
  scrollBtn.title = 'Voltar ao topo';
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Adiciona ao DOM
  document.body.appendChild(scrollBtn);

  // Controla a visibilidade do botão baseado na posição do scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
}

/**
 * Remove os breadcrumbs da página
 */
export function removeBreadcrumbs(): void {
  const breadcrumbs = document.querySelector('.breadcrumb');
  if (breadcrumbs) {
    breadcrumbs.remove();
  }
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
 * Verifica se estamos em uma página específica
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
 * Adiciona botão para adicionar opções de ordenação à página
 */
export function addSortOptions(
  container: Element,
  items: NodeListOf<Element>,
  sortConfig: {
    defaultSort: string;
    options: { id: string; label: string; sortFn: (a: Element, b: Element) => number }[];
  },
): void {
  // Verifica se as opções de ordenação já existem
  if (container.querySelector('.mannco-sort-options')) return;

  // Cria container para as opções
  const sortContainer = document.createElement('div');
  sortContainer.className = 'mannco-sort-options';
  sortContainer.style.margin = '10px 0';
  sortContainer.style.display = 'flex';
  sortContainer.style.alignItems = 'center';

  // Adiciona label
  const label = document.createElement('span');
  label.textContent = 'Ordenar por: ';
  label.style.marginRight = '10px';
  label.style.fontWeight = 'bold';
  sortContainer.appendChild(label);

  // Adiciona select para opções
  const select = document.createElement('select');
  select.style.padding = '5px';
  select.style.borderRadius = '4px';

  // Adiciona opções ao select
  sortConfig.options.forEach(option => {
    const optElement = document.createElement('option');
    optElement.value = option.id;
    optElement.textContent = option.label;
    select.appendChild(optElement);
  });

  // Define o valor padrão
  select.value = sortConfig.defaultSort;

  // Adiciona evento de alteração
  select.addEventListener('change', () => {
    const selectedOption = sortConfig.options.find(opt => opt.id === select.value);

    if (selectedOption && container) {
      // Converte NodeList em array para poder ordenar
      const itemsArray = Array.from(items);

      // Ordena os itens
      itemsArray.sort(selectedOption.sortFn);

      // Reinsere os itens na ordem correta
      itemsArray.forEach(item => {
        container.appendChild(item);
      });
    }
  });

  sortContainer.appendChild(select);

  // Adiciona ao container
  container.insertBefore(sortContainer, container.firstChild);
}
