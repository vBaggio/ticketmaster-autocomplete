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

  // Reusar setInputValue do holder-filler.js (carregado antes no manifest)
  setInputValue(input, card.holderName);

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
    <div style="font-weight: bold; margin-bottom: 4px;">💳 Preencha os campos abaixo manualmente (protegidos pelo Adyen):</div>
    <div style="display: flex; gap: 16px; font-family: monospace; font-size: 15px;">
      <div><strong>Número:</strong> <span style="user-select: all; background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe;">${card.number}</span></div>
      <div><strong>Validade:</strong> <span style="user-select: all; background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe;">${card.expiration}</span></div>
      <div><strong>CVV:</strong> <span style="user-select: all; background: #fff; padding: 2px 4px; border-radius: 2px; border: 1px solid #c7d2fe;">${card.cvv}</span></div>
    </div>
  `;

  console.log(
    '[TM-Auto] Cartão:', card.label,
    '— Titular preenchido. Preencher manualmente:',
    'Número:', card.number,
    '| Validade:', card.expiration,
    '| CVV:', card.cvv
  );
}
