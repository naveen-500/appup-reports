// Import Dynamic from '@appup/appup-components-dynamic';
// Import AppupControls from '@appup/components';
window._gd = {};
const gridsterUrl = 'https://portal.500apps.io/v2a/gridster';
// eslint-disable-next-line capitalized-comments
// remove url's
window.gridsterUrl = `${getUrl()}/pcors?url=${encodeURIComponent(gridsterUrl)}`;
/* eslint-disable camelcase */
export function getUrl () {
  return 'https://appup2.dev.500apps.io'
}
// Export { AppupControls, Dynamic };
