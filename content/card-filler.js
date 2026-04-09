/**
 * Card Filler — preenche o nome do titular no formulário Adyen
 *
 * Limitação: número, validade e CVV estão em iframes cross-origin (Adyen Drop-in)
 * e não podem ser preenchidos por content scripts. Apenas o cardholder name é acessível.
 */

async function fillCardHolder(card) {
  const input = document.querySelector('#card_holder_name');
  if (!input) {
    console.warn('[TM-Auto] #card_holder_name não encontrado');
    return;
  }

  // Injetar Titular (Fica fora do iframe Adyen)
  setInputValue(input, card.holderName);

  // Selecionar 1 parcela (à vista) por padrão no combobox - Aguarda o Adyen carregar o DOM
  const trySelectInstallment = (sel) => {
    const opt1x = Array.from(sel.options).find(opt => 
      !opt.disabled && (opt.value === "1" || opt.text.toLowerCase().includes('1x') || opt.text.toLowerCase().includes('1 parcela') || opt.text.toLowerCase().includes('à vista'))
    );
    
    if (opt1x) {
      if (typeof setSelectValue === 'function') {
        setSelectValue(sel, opt1x.value);
      } else {
        const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        if (nativeSetter) nativeSetter.call(sel, opt1x.value);
        else sel.value = opt1x.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      console.log('[TM-Auto] Parcelamento configurado para 1x (à vista).');
      return true;
    }
    return false;
  };

  let installmentFound = false;
  document.querySelectorAll('select').forEach(sel => { if (trySelectInstallment(sel)) installmentFound = true; });

  // Se não achou na hora (porque a Adyen exibe só após o número do cartão), cria um Observer
  if (!installmentFound) {
    const checkoutActions = document.querySelector('#checkout-actions') || document.body;
    const parcelObserver = new MutationObserver((mutations, obs) => {
      document.querySelectorAll('select').forEach(sel => {
        if (trySelectInstallment(sel)) {
          obs.disconnect();
        }
      });
    });
    parcelObserver.observe(checkoutActions, { childList: true, subtree: true });
    // Desliga o observer após 2 minutos para não vazar memória no navegador
    setTimeout(() => parcelObserver.disconnect(), 120000);
  }

  let infoBox = document.querySelector('#tm-auto-card-info');
  if (!infoBox) {
    infoBox = document.createElement('div');
    infoBox.id = 'tm-auto-card-info';
    infoBox.style.cssText = 'background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #1e3a8a; font-size: 14px; line-height: 1.5;';
    
    const toolbar = document.querySelector('#tm-auto-cards-toolbar');
    if (toolbar) {
      toolbar.insertAdjacentElement('afterend', infoBox);
    } else {
      const container = input.closest('.form-item') || input.parentElement;
      container.insertAdjacentElement('afterend', infoBox);
    }
  }

  infoBox.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">💳 Assistente de Cartão Adyen</div>
    <div style="font-size: 13px; color: #4338ca; margin-bottom: 8px;">O Titular foi preenchido. Para garantir a segurança, Adyen usa iframes para os demais campos.<br>Use os botões abaixo para <strong>copiar os dados</strong> rapidamente e cole (<code>CTRL + V</code>):</div>
    <div style="display: flex; gap: 16px; font-family: monospace; font-size: 14px; margin-top: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <strong>Cartão:</strong> <span style="background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe; user-select: all;">${card.number}</span>
        <button class="tm-auto-cmd-copy" data-val="${String(card.number).replace(/\s/g, '')}" style="cursor:pointer; padding:2px 8px; border-radius:4px; border:none; background:#4f46e5; color:white; font-size:12px; transition: background 0.2s;">Copiar</button>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <strong>Validade:</strong> <span style="background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe; user-select: all;">${card.expiration}</span>
        <button class="tm-auto-cmd-copy" data-val="${card.expiration}" style="cursor:pointer; padding:2px 8px; border-radius:4px; border:none; background:#4f46e5; color:white; font-size:12px; transition: background 0.2s;">Copiar</button>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <strong>CVV:</strong> <span style="background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe; user-select: all;">${card.cvv}</span>
        <button class="tm-auto-cmd-copy" data-val="${card.cvv}" style="cursor:pointer; padding:2px 8px; border-radius:4px; border:none; background:#4f46e5; color:white; font-size:12px; transition: background 0.2s;">Copiar</button>
      </div>
    </div>
  `;

  // Anexar Listeners dos Botoes interativos
  const btns = infoBox.querySelectorAll('.tm-auto-cmd-copy');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(e.target.getAttribute('data-val')).catch(()=>{});
      e.target.innerText = '✓ Copiado';
      e.target.style.background = '#16a34a';
      setTimeout(() => { e.target.innerText = 'Copiar'; e.target.style.background = '#4f46e5'; }, 1500);
    });
  });

  console.log('[TM-Auto] Cartão:', card.label, '— Fallback via Área de Transferência Inteligente ativado.');
}
