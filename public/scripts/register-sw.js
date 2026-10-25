if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[BME PWA] Service Worker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[BME PWA] Service Worker registration failed:', err);
      });
  });
}
