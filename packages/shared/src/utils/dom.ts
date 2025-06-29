/**
 * Mannco.store Enhancer - DOM Utility Functions
 * Common DOM manipulation and helper functions
 */

/**
 * Verifies if we're on a specific page of mannco.store
 */
export function isOnPage(path: string): boolean {
  // Handles translations like /ru/giveaways by checking if URL contains the path
  return (
    window.location.href.includes(`mannco.store${path}`) ||
    window.location.href.match(new RegExp(`mannco\\.store/\\w+${path.replace(/\//g, '\\/')}$`)) !==
      null
  );
}

/**
 * Creates and injects CSS into the page
 */
export function injectCSS(cssContent: string, id: string): void {
  // Check if the style already exists
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.textContent = cssContent;
    return;
  }

  // Create new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssContent;
  document.head.appendChild(style);

  console.log(`MannCo Enhancer: Injected CSS with ID "${id}"`);
}

/**
 * Removes an element from the DOM
 */
export function removeElement(selector: string): void {
  const element = document.querySelector(selector);
  if (element) {
    element.remove();
    console.log(`MannCo Enhancer: Removed element "${selector}"`);
  }
}

/**
 * Extracts numeric price value from a text string
 */
export function extractPriceValue(priceText: string | null): number {
  if (!priceText) return 0;
  const numericValue = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
}

/**
 * Creates a button with specified properties
 */
export function createButton(
  text: string,
  classList: string[] = [],
  clickHandler?: (e: MouseEvent) => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add(...classList);

  if (clickHandler) {
    button.addEventListener('click', clickHandler);
  }

  return button;
}

/**
 * Returns true if the element is visible in the viewport
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Adds a "scroll to top" button to the page
 */
export function addScrollToTopButton(): void {
  // Check if button already exists
  if (document.getElementById('mannco-scroll-to-top')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'mannco-scroll-to-top';
  button.textContent = '↑';
  button.title = 'Scroll to top';

  // Style the button
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'none',
    zIndex: '9999',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  });

  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#3e8e41';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#4CAF50';
  });

  // Add click handler
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  });

  // Add button to the document
  document.body.appendChild(button);

  console.log('MannCo Enhancer: Added scroll to top button');
}

/**
 * Waits for an element to appear in the DOM
 */
export function waitForElement(selector: string, timeout = 10000): Promise<Element | null> {
  return new Promise(resolve => {
    // Check if the element already exists
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    // Set a timeout to avoid waiting forever
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      console.log(`MannCo Enhancer: Timed out waiting for element "${selector}"`);
      resolve(null);
    }, timeout);

    // Set up a mutation observer to watch for the element
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timeoutId);
        obs.disconnect();
        resolve(element);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
