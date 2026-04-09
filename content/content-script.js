/**
 * Content Script — entrypoint da extensão no Ticketmaster
 */

console.log('[TM-Auto] Content script iniciado');

let holderObserver = null;
let lastDetectedStage = null;

// ===== DETECÇÃO DE ETAPAS =====

function detectCheckoutStage() {
  const h1 = document.querySelector('#checkout-actions h1');
  
  // Em alguns pequenos popups intermediários a h1 pode estar ausente ou escondida
  if (!h1) {
    handleIntermediaryStages();
    return;
  }

  const text = h1.textContent.trim();
  if (text === lastDetectedStage) return; // mesma etapa, não re-processar
  lastDetectedStage = text;

  console.log('[TM-Auto] Etapa ativa no Painel Mestre:', text);

  if (text.includes('Detalhes dos participantes')) {
    handleHolderStage();
  } else if (text.includes('Insira os dados do seu cartão')) {
    handleCardStage();
  } else if (text.includes('Novo endereço de cobrança')) {
    // Congela a automação na tela de Endereço. Respeitando a regra: não pode ser pulada!
    console.log('[TM-Auto] Etapa de Endereço detectada. Automação Pausada.');
  } else {
    // Processar popups e etapas soltas (Termos, Seguro, Entrega)
    handleIntermediaryStages();
  }
}

function handleIntermediaryStages() {
  // A. Etapa de Entrega - Seleciona se houver 1 apenas, ou se for Grátis.
  const deliveryOptions = document.querySelectorAll('li.delivery-select');
  if (deliveryOptions.length > 0) {
    if (deliveryOptions.length === 1) {
      if (!deliveryOptions[0].classList.contains('selected')) deliveryOptions[0].click();
      console.log('[TM-Auto] Única opção de entrega foi auto-selecionada.');
    } else {
      const freeOption = Array.from(deliveryOptions).find(opt => opt.textContent.toLowerCase().match(/grátis|gratuito|R\\$ 0,00/));
      if (freeOption && !freeOption.classList.contains('selected')) {
        freeOption.click();
        console.log('[TM-Auto] Opção de entrega gratuita auto-selecionada.');
      }
    }
  }

  // B. Etapa de Seguro - Nega por padrão (para evitar cobrança surpresa)
  const removeInsurance = document.querySelector('li#removeInsurance');
  if (removeInsurance && !removeInsurance.classList.contains('selected')) {
    removeInsurance.click();
    console.log('[TM-Auto] Seguro contra imprevistos recusado automaticamente.');
  }

  // C. Auto-marcar Checkboxes Relevantes (Termos, Políticas) deixando Marketing de lado
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
  checkboxes.forEach(cb => {
    const parentText = (cb.parentElement.textContent || cb.getAttribute('aria-label') || '').toLowerCase();
    
    // Filtramos palavras chaves de opt-in mandatório:
    if (parentText.includes('aceito') || parentText.includes('concordo') || parentText.includes('termos') || parentText.includes('declaro') || parentText.includes('confirm')) {
      cb.click();
      console.log('[TM-Auto] Checkbox obrigatória de concordância marcada.');
    }
  });

  // D. Etapa Dedicada de "Termos e Condições" (onde há apenas o botão de aceite para prosseguir)
  const h1 = document.querySelector('#checkout-actions h1');
  if (h1 && h1.textContent.includes('Termos e Condições')) {
    const acceptBtn = document.querySelector('#checkout-actions a.btn.next') || document.querySelector('#checkout-actions a.next');
    if (acceptBtn) {
      acceptBtn.click();
      console.log('[TM-Auto] Botão isolado de aceite dos Termos clicado automaticamente.');
    }
  }

  // E. Etapa "Confirme a operação" (Resumo final antes do Pagamento)
  if (h1 && h1.textContent.includes('Confirme a operação')) {
    getSetting('autoConfirmCheckout').then(isAutoConfirm => {
      if (isAutoConfirm) {
        const confirmBtn = document.querySelector('#confirmCheckout');
        if (confirmBtn && !confirmBtn.disabled) {
          confirmBtn.click();
          console.log('[TM-Auto] Avanço Automático LIGADO. Botão de Confirmação clicado automaticamente.');
        }
      } else {
        console.log('[TM-Auto] Tela de Confirmação detectada. Pausado para revisão (Avanço Auto desligado nas opções).');
      }
    });
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
