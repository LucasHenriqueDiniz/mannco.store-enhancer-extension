export function isOnPage(path: string): boolean {
  /**
   * Check if we're on a specific page of mannco.store
   * @example: /giveaways, /inventory, /ru/giveaways
   * @param path - The path to check against the current URL
   * @return boolean - True if the current URL matches the path, false otherwise
   */
  return (
    window.location.href.includes(`mannco.store${path}`) ||
    window.location.href.match(new RegExp(`mannco\\.store/\\w+${path.replace(/\//g, '\\/')}$`)) !==
      null
  );
}
