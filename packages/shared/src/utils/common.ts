/**
 * Mannco.store Enhancer - Common Utility Functions
 * Contains utility functions used across multiple modules
 */

/**
 * Check if we're currently on a specific page type
 * @param pagePattern A pattern (string or RegExp) to match against the current URL
 * @returns True if the current page matches the pattern
 */
export function isOnPage(pagePattern: string | RegExp): boolean {
  if (typeof pagePattern === 'string') {
    return window.location.href.includes(pagePattern);
  } else {
    return pagePattern.test(window.location.href);
  }
}

/**
 * Inject CSS into the page
 * @param css The CSS string to inject
 * @param id Optional ID for the style element
 * @returns The created style element
 */
export function injectCSS(css: string, id?: string): HTMLStyleElement {
  const style = document.createElement('style');
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

/**
 * Wait for an element to appear in the DOM
 * @param selector CSS selector for the element
 * @param parent Optional parent element to search within
 * @param timeout Maximum time to wait in milliseconds
 * @returns A promise that resolves to the element or null if timeout
 */
export function waitForElement(
  selector: string,
  parent: Element | Document = document,
  timeout: number = 10000,
): Promise<Element | null> {
  return new Promise(resolve => {
    // Check if element already exists
    const element = parent.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    // Set a timeout to avoid waiting forever
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);

    // Create a mutation observer to watch for the element
    const observer = new MutationObserver(mutations => {
      const element = parent.querySelector(selector);
      if (element) {
        clearTimeout(timeoutId);
        observer.disconnect();
        resolve(element);
      }
    });

    // Start observing
    observer.observe(parent, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Create a DOM element with attributes and children
 * @param tagName The HTML tag name
 * @param attributes Optional attributes to set on the element
 * @param children Optional children (string content or other elements)
 * @returns The created element
 */
export function createElement<T extends HTMLElement>(
  tagName: string,
  attributes: Record<string, string | boolean | Function> = {},
  children: (Node | string)[] = [],
): T {
  const element = document.createElement(tagName) as T;

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      // Event handler
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else if (typeof value === 'boolean') {
      // Boolean attribute
      if (value) {
        element.setAttribute(key, '');
      }
    } else {
      // Regular attribute
      element.setAttribute(key, value as string);
    }
  });

  // Add children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Observe DOM changes and run a callback when elements matching a selector are added
 * @param selector CSS selector for elements to watch for
 * @param callback Function to call when matching elements are found
 * @param parent Optional parent element to observe within
 * @returns Function to disconnect the observer
 */
export function observeForElements(
  selector: string,
  callback: (elements: Element[]) => void,
  parent: Element | Document = document,
): () => void {
  const observer = new MutationObserver(mutations => {
    // Check if any matching elements were added
    const newElements: Element[] = [];

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node matches our selector
          if ((node as Element).matches(selector)) {
            newElements.push(node as Element);
          }

          // Check children of added node
          const childMatches = (node as Element).querySelectorAll(selector);
          childMatches.forEach(match => newElements.push(match));
        }
      });
    });

    if (newElements.length > 0) {
      callback(newElements);
    }
  });

  observer.observe(parent, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}

/**
 * Format a price value according to the site's format
 * @param price The price value to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Add a debounced event listener
 * @param element Element to attach the listener to
 * @param eventType Event type (e.g., 'click', 'input')
 * @param callback Callback function to run
 * @param delay Debounce delay in milliseconds
 * @returns Function to remove the event listener
 */
export function addDebouncedEventListener(
  element: HTMLElement,
  eventType: string,
  callback: (event: Event) => void,
  delay: number = 300,
): () => void {
  let timeoutId: number | undefined;

  const debouncedCallback = (event: Event) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(event);
    }, delay);
  };

  element.addEventListener(eventType, debouncedCallback);

  return () => {
    element.removeEventListener(eventType, debouncedCallback);
    clearTimeout(timeoutId);
  };
}

/**
 * Get the price from a text string
 * @param text Text containing a price
 * @returns Extracted price as a number, or null if not found
 */
export function getPriceFromString(text: string): number | null {
  const match = text.match(/\d+\.\d+/);
  if (match) {
    return parseFloat(match[0]);
  }
  return null;
}

/**
 * Throttle a function call to limit execution frequency
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Safely parse JSON with error handling
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Calculate the percentage difference between two numbers
 * @param oldValue Original value
 * @param newValue New value
 * @returns Percentage difference (positive means increase, negative means decrease)
 */
export function percentageDifference(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Format a currency value based on user preferences or locale
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale to use for formatting (default: browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = navigator.language,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Extract an item name from mannco.store item element
 * @param itemElement DOM element containing the item data
 * @returns The extracted item name or null if not found
 */
export function extractItemName(itemElement: Element): string | null {
  const nameElement = itemElement.querySelector('.item-name, .market-name');
  return nameElement ? nameElement.textContent?.trim() || null : null;
}

/**
 * Create a tooltip element that follows the cursor
 * @param content Content to show in the tooltip (string or HTML element)
 * @returns Object with show, hide, and update methods
 */
export function createTooltip(content: string | HTMLElement) {
  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'mannco-enhancer-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;

  if (typeof content === 'string') {
    tooltipElement.textContent = content;
  } else {
    tooltipElement.appendChild(content);
  }

  document.body.appendChild(tooltipElement);

  const tooltip = {
    show(x: number, y: number): void {
      tooltipElement.style.left = `${x + 15}px`;
      tooltipElement.style.top = `${y + 15}px`;
      tooltipElement.style.opacity = '1';
    },
    hide(): void {
      tooltipElement.style.opacity = '0';
    },
    update(newContent: string | HTMLElement): void {
      while (tooltipElement.firstChild) {
        tooltipElement.removeChild(tooltipElement.firstChild);
      }

      if (typeof newContent === 'string') {
        tooltipElement.textContent = newContent;
      } else {
        tooltipElement.appendChild(newContent);
      }
    },
    element: tooltipElement,
    destroy(): void {
      document.body.removeChild(tooltipElement);
    },
  };

  return tooltip;
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when text is copied, or rejects on error
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text: ', err);
    throw err;
  });
}

/**
 * Load an image and get its dimensions
 * @param url Image URL
 * @returns Promise resolving to image dimensions
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Add a one-time event listener that removes itself after execution
 * @param element Element to attach the listener to
 * @param eventType Event type to listen for
 * @param callback Callback function to execute once
 */
export function addOneTimeEventListener(
  element: HTMLElement | Document | Window,
  eventType: string,
  callback: (event: Event) => void,
): void {
  const oneTimeCallback = (event: Event) => {
    callback(event);
    element.removeEventListener(eventType, oneTimeCallback);
  };
  element.addEventListener(eventType, oneTimeCallback);
}
