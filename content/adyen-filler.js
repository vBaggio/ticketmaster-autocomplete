/**
 * Adyen IFrame Filler
 * Rodando dentro dos iframes protegidos (checkoutshopper-[live/test].adyen.com)
 */

window.addEventListener('message', (event) => {
  // Assegura que só reage ao chamado da nossa extensão principal!
  if (event.data && event.data.type === 'TM_AUTO_FILL_ADYEN') {
    const card = event.data.card;
    const input = document.querySelector('input');
    
    if (!input) return;
    
    const inputId = input.id || input.getAttribute('data-fieldtype') || '';
    const ariaLabel = input.getAttribute('aria-label') || '';
    
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    
    let valToFill = null;
    
    if (inputId.toLowerCase().includes('cardnumber') || ariaLabel.toLowerCase().includes('número')) {
      valToFill = card.number;
    } else if (inputId.toLowerCase().includes('expiry') || ariaLabel.toLowerCase().includes('expiração') || ariaLabel.toLowerCase().includes('validade')) {
      valToFill = card.expiration;
    } else if (inputId.toLowerCase().includes('securitycode') || inputId.toLowerCase().includes('cvv') || ariaLabel.toLowerCase().includes('segurança')) {
      valToFill = card.cvv;
    }

    if (valToFill !== null) {
      if (nativeSetter) {
        nativeSetter.call(input, valToFill);
      } else {
        input.value = valToFill;
      }
      
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      
      console.log(`[TM-Auto Iframe] Preencheu com sucesso o campo: ${inputId || ariaLabel}`);
    }
  }
});

console.log('[TM-Auto Iframe] Adyen Interceptor escutando eventos em', window.location.host);
