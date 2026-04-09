/**
 * Service Worker — inicializa storage na primeira instalação
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (data) => {
    // Se storage está vazio, inicializar com estrutura padrão
    if (Object.keys(data).length === 0) {
      chrome.storage.local.set({
        users: [],
        cards: [],
        settings: {
          enabled: true
        }
      });
      console.log('[Ticketmaster Autocomplete] Storage inicializado');
    }
  });
});

// Log para debug
console.log('[Ticketmaster Autocomplete] Service Worker carregado');
