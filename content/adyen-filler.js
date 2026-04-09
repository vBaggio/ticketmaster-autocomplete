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
      // Feedback visual para o usuário saber que a extensão "acordou" dentro do iframe
      document.body.style.transition = 'all 0.3s ease';
      document.body.style.border = '2px solid #4338ca';
      document.body.style.borderRadius = '4px';

      // Remove qualquer formatação (espaços, traços)
      const digits = String(valToFill).replace(/\\s/g, '');

      // Foca no input
      input.focus();
      input.select();
      
      // Tática 1: Simular a digitação nativa do usuário (Funciona muito bem em máscaras como Adyen)
      document.execCommand('insertText', false, digits);

      // Tática 2: Fallback para a propriedade 'value' descritora pura (se a 1 falhar)
      if (nativeSetter && input.value !== digits) {
        nativeSetter.call(input, digits);
      } else if (input.value !== digits) {
        input.value = digits;
      }
      
      // Emitir Eventos
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      
      console.log(`[TM-Auto Iframe] Preencheu com sucesso o campo: ${inputId || ariaLabel}`);
      
      // Retira borda após preencher
      setTimeout(() => { document.body.style.border = 'none'; }, 1000);
    }
  }
});

console.log('[TM-Auto Iframe] Adyen Interceptor escutando eventos em', window.location.host);
