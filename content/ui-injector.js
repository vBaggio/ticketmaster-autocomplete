/**
 * UI Injector — injeta barras de botões no checkout
 */

const TOOLBAR_STYLE = `
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 0 16px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const BTN_STYLE = `
  padding: 7px 14px;
  background: #024DDF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
`;

const BTN_HOVER_STYLE = 'background: #0138A8;';
const LABEL_STYLE = `
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: center;
  margin-right: 4px;
`;

function makeButton(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.setAttribute('style', BTN_STYLE);
  btn.addEventListener('mouseover', () => btn.setAttribute('style', BTN_STYLE + BTN_HOVER_STYLE));
  btn.addEventListener('mouseout', () => btn.setAttribute('style', BTN_STYLE));
  btn.addEventListener('click', onClick);
  return btn;
}

function makeLabel(text) {
  const span = document.createElement('span');
  span.textContent = text;
  span.setAttribute('style', LABEL_STYLE);
  return span;
}

async function injectUserButtons(holderActiveEl) {
  // Evitar duplicação
  if (holderActiveEl.querySelector('#tm-auto-users-toolbar')) return;

  const users = await getUsers();
  if (users.length === 0) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'tm-auto-users-toolbar';
  toolbar.setAttribute('style', TOOLBAR_STYLE);

  toolbar.appendChild(makeLabel('Preencher com:'));

  users.forEach(user => {
    const btn = makeButton(user.label || 'Sem nome', () => {
      fillHolder(user, holderActiveEl);
    });
    toolbar.appendChild(btn);
  });

  // Inserir como primeiro filho do holder ativo
  holderActiveEl.insertBefore(toolbar, holderActiveEl.firstChild);
}

async function injectCardButtons() {
  // Evitar duplicação
  if (document.querySelector('#tm-auto-cards-toolbar')) return;

  const cards = await getCards();
  if (cards.length === 0) return;

  const cardHolderInput = document.querySelector('#card_holder_name');
  if (!cardHolderInput) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'tm-auto-cards-toolbar';
  toolbar.setAttribute('style', TOOLBAR_STYLE);

  toolbar.appendChild(makeLabel('Preencher com:'));

  cards.forEach(card => {
    const btn = makeButton(card.label || 'Sem nome', () => {
      fillCardHolder(card);
    });
    toolbar.appendChild(btn);
  });

  // Inserir antes do container do campo de cardholder
  const container = cardHolderInput.closest('.form-item') || cardHolderInput.parentElement;
  if (container && container.parentElement) {
    container.parentElement.insertBefore(toolbar, container);
  } else {
    cardHolderInput.parentElement.insertBefore(toolbar, cardHolderInput);
  }
}

async function injectAddressButtons(formEl) {
  // Evitar duplicação
  if (formEl.parentElement.querySelector('#tm-auto-address-toolbar')) return;

  const addresses = await getAddresses();
  if (addresses.length === 0) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'tm-auto-address-toolbar';
  toolbar.setAttribute('style', TOOLBAR_STYLE);

  toolbar.appendChild(makeLabel('Preencher com:'));

  addresses.forEach(addr => {
    const btn = makeButton(addr.label || 'Sem nome', () => {
      if (typeof fillAddress === 'function') {
        fillAddress(addr, formEl);
      } else {
        console.warn('[TM-Auto] fillAddress não encontrado. address-filler.js foi carregado?');
      }
    });
    toolbar.appendChild(btn);
  });

  // Inserir antes do formulário
  formEl.parentElement.insertBefore(toolbar, formEl);
}
