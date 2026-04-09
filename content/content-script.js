/**
 * Content Script — entrypoint da extensão no Ticketmaster
 */

console.log('[TM-Auto] Content script iniciado');

let holderObserver = null;
let lastDetectedStage = null;

// ===== DETECÇÃO DE ETAPAS =====

function detectCheckoutStage() {
  const h1 = document.querySelector('#checkout-actions h1');
  if (!h1) return;

  const text = h1.textContent.trim();
  if (text === lastDetectedStage) return; // mesma etapa, não re-processar
  lastDetectedStage = text;

  console.log('[TM-Auto] Etapa:', text);

  if (text.includes('Detalhes dos participantes')) {
    handleHolderStage();
  } else if (text.includes('Insira os dados do seu cartão')) {
    handleCardStage();
  }
}

function handleHolderStage() {
  const holderActive = document.querySelector('.holder-active');
  if (holderActive) {
    injectUserButtons(holderActive);
  }

  // Observar mudanças de classe para detectar quando holder muda de estado
  if (holderObserver) holderObserver.disconnect();

  const checkoutActions = document.querySelector('#checkout-actions');
  if (!checkoutActions) return;

  holderObserver = new MutationObserver(() => {
    const active = document.querySelector('.holder-active');
    if (active && !active.querySelector('#tm-auto-users-toolbar')) {
      injectUserButtons(active);
    }
  });

  holderObserver.observe(checkoutActions, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

function handleCardStage() {
  // Adyen pode demorar para renderizar os iframes — aguardar o form aparecer
  const tryInject = (retries = 10) => {
    if (document.querySelector('#card_holder_name')) {
      injectCardButtons();
    } else if (retries > 0) {
      setTimeout(() => tryInject(retries - 1), 300);
    }
  };
  tryInject();
}

// ===== INICIALIZAÇÃO =====

function init() {
  const checkoutActions = document.querySelector('#checkout-actions');
  if (!checkoutActions) return;

  detectCheckoutStage();

  // Observar mudanças em #checkout-actions (subtree para capturar transições SPA)
  // Não resetar lastDetectedStage — o guard em detectCheckoutStage() evita re-processar
  // a mesma etapa quando a injeção de botões modifica o DOM.
  const checkoutObserver = new MutationObserver(debounce(() => {
    detectCheckoutStage();
  }, 200));

  checkoutObserver.observe(checkoutActions, {
    childList: true,
    subtree: true
  });

  console.log('[TM-Auto] Observer iniciado');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Aguardar #checkout-actions aparecer (pode não existir ao carregar a página)
const waitForCheckout = new MutationObserver(debounce(() => {
  if (document.querySelector('#checkout-actions')) {
    waitForCheckout.disconnect();
    init();
  }
}, 200));

waitForCheckout.observe(document.body, { childList: true, subtree: true });

// Se já existe ao carregar (ex: F5 na página de checkout)
if (document.querySelector('#checkout-actions')) {
  waitForCheckout.disconnect();
  init();
}
