/**
 * Holder Filler — preenche os dados de um participante (meia-entrada)
 */

// ===== HELPERS DE INPUT =====

/**
 * Preenche input normal (React-aware): usa nativeSetter + eventos sintéticos.
 */
function setInputValue(el, value) {
  if (!el) return;
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  nativeSetter.call(el, value);
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur',   { bubbles: true }));
}

/**
 * Preenche input COM máscara (im-insert="true").
 * A biblioteca imask intercepta eventos nativos do browser; execCommand('insertText')
 * é a única forma confiável de trigá-la programaticamente.
 * Passa apenas dígitos — a máscara aplica a formatação automaticamente.
 */
async function setMaskedInputValue(el, rawValue) {
  if (!el) return;

  const digits = String(rawValue).replace(/\D/g, '');

  let formatted = String(rawValue);
  if (digits.length === 11 && !formatted.includes('-')) {
    formatted = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  el.focus();
  el.select();
  await delay(10);

  // Tática 1: execCommand com os digitos
  document.execCommand('insertText', false, digits);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  await delay(20);

  // Tática 2: native setter force
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  if (nativeSetter) {
    nativeSetter.call(el, el.value || formatted);
  }

  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur',   { bubbles: true }));
  
  // Força uma revalidação
  el.focus();
  await delay(10);
  el.blur();
}

function setSelectValue(el, value) {
  if (!el) return;
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  nativeSetter.call(el, value);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Aguarda #extra-fields ter filhos (injetados após clicar no tipo de meia-entrada).
 * Timeout de 3s para não travar indefinidamente.
 */
function waitForExtraFields(holderActiveEl) {
  return new Promise((resolve) => {
    const extraFields = holderActiveEl.querySelector('#extra-fields');
    if (!extraFields) { resolve(); return; }
    if (extraFields.children.length > 0) { resolve(); return; }

    const obs = new MutationObserver(() => {
      if (extraFields.children.length > 0) {
        obs.disconnect();
        resolve();
      }
    });
    obs.observe(extraFields, { childList: true });
    setTimeout(() => { obs.disconnect(); resolve(); }, 3000);
  });
}

// ===== PREENCHIMENTO POR TIPO =====

async function fillExtraFields(holderActiveEl, halfTicket, personal) {
  const scope = holderActiveEl.querySelector('#extra-fields');
  if (!scope) return;

  switch (halfTicket.type) {
    case 'Student':
      // #dateOfBirth existe dentro de #extra-fields e tem máscara
      await setMaskedInputValue(scope.querySelector('#dateOfBirth'), personal.birthDate || '');
      await delay(50);
      // #CIE é alfanumérico sem máscara
      setInputValue(scope.querySelector('#CIE'), halfTicket.cieNumber);
      await delay(30);
      // #validityDate tem máscara (DD/MM/AAAA)
      await setMaskedInputValue(scope.querySelector('#validityDate'), halfTicket.expiration);
      await delay(50);
      setInputValue(scope.querySelector('#institutionName'), halfTicket.institution);
      await delay(30);
      setInputValue(scope.querySelector('#city'), halfTicket.city);
      await delay(30);
      setSelectValue(scope.querySelector('#state'), halfTicket.state);
      await delay(30);
      setInputValue(scope.querySelector('#course'), halfTicket.course);
      break;

    // Campos extras dos outros tipos ainda não mapeados (HTML não capturado)
    case 'DisabledPerson':
    case 'LowIncomeYouth':
    case 'Teachers':
    case 'OldMan':
    case 'Retirees':
      console.log('[TM-Auto] Campos extras para', halfTicket.type, 'ainda não mapeados');
      break;
  }
}

// ===== FLUXO PRINCIPAL =====

async function fillHolder(user, holderActiveEl) {
  const { personal, halfTicket } = user;
  console.log('[TM-Auto] Preenchendo holder para:', user.label);

  try {
    // 1. Selecionar tipo de meia-entrada PRIMEIRO (Evita que o React re-renderize e apague os campos comuns)
    if (halfTicket.type) {
      const typeOption = holderActiveEl.querySelector(`div[data-type="${halfTicket.type}"] li.holder-option`);
      if (typeOption) {
        typeOption.click();
        await delay(150);

        // Se o tipo já estava selecionado, o click deselecionou (toggle).
        // Verificar: se #extra-fields ficou vazio, clicar novamente para re-selecionar.
        const extraFields = holderActiveEl.querySelector('#extra-fields');
        if (extraFields && extraFields.children.length === 0) {
          console.log('[TM-Auto] Tipo foi deseleccionado (toggle), re-selecionando...');
          typeOption.click();
          await delay(150);
        }

        // Aguardar #extra-fields ser populado
        await waitForExtraFields(holderActiveEl);
        await delay(100); // tempo extra pro React estabilizar a DOM
      } else {
        console.warn('[TM-Auto] Tipo não encontrado no DOM:', halfTicket.type);
      }
    }

    // 2. Preencher campos comuns (Nome, Sobrenome, CPF)
    const nameParts = personal.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName  = nameParts.slice(1).join(' ') || '';

    setInputValue(holderActiveEl.querySelector('#firstName'), firstName);
    await delay(30);
    setInputValue(holderActiveEl.querySelector('#lastName'), lastName);
    await delay(30);

    // CPF tem máscara
    await setMaskedInputValue(holderActiveEl.querySelector('#documentNumber'), personal.cpf);
    await delay(50);

    // 3. Preencher campos extras
    if (halfTicket.type) {
      await fillExtraFields(holderActiveEl, halfTicket, personal);
      await delay(30);
    }

    // 5. Marcar checkbox de confirmação
    const checkbox = holderActiveEl.querySelector('input[name="confirmData"]');
    if (checkbox && !checkbox.checked) {
      checkbox.click();
      await delay(30);
    }

    // 6. Salvar holder
    const saveBtn = holderActiveEl.querySelector('#saveHolder');
    if (saveBtn) {
      saveBtn.click();
      console.log('[TM-Auto] Holder salvo');
    }
  } catch (err) {
    console.error('[TM-Auto] Erro ao preencher holder:', err);
  }
}
