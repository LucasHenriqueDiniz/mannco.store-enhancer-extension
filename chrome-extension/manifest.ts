import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * Manifest para a extensão Mannco.store Enhancer
 * Limitando permissões apenas para o site mannco.store
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: 'Mannco.store Enhancer',
  browser_specific_settings: {
    gecko: {
      id: 'example@example.com',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description: 'Enhances the mannco.store website with additional features and improvements',

  // Limitando permissões apenas para mannco.store - mais seguro para o usuário
  host_permissions: ['*://*.mannco.store/*'],
  permissions: ['storage'],

  options_page: 'options/index.html',
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: {
      '34': 'icon-34.png',
      '128': 'icon-128.png',
    },
  },
  icons: {
    '34': 'icon-34.png',
    '128': 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['*://*.mannco.store/*'],
      js: ['content/index.iife.js'],
      css: ['mannco-styles.css'],
    },
    {
      matches: ['*://*.mannco.store/*'],
      js: ['content-ui/index.iife.js'],
    },
    {
      matches: ['*://*.mannco.store/*'],
      css: ['content.css'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.png', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*.mannco.store/*'],
    },
  ],
} satisfies chrome.runtime.ManifestV3;

export default manifest;
