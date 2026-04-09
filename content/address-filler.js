/**
 * Address Filler — preenche o endereço com sincronização de chamadas de API (vi CEP)
 */

function fillAddress(address, formEl) {
  console.log('[TM-Auto] Iniciando preenchimento de endereço de cobrança...');

  const setAddressValue = (selector, val) => {
    const input = formEl.querySelector(selector);
    if (!input) return null;
    
    // Funções nativas para engatilhar o React do GetCrowder
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (nativeSetter) {
      nativeSetter.call(input, val);
    } else {
      input.value = val;
    }
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return input;
  };

  // 1. Preenche Nome e Sobrenome (campos passivos)
  setAddressValue('#firstName', address.firstName);
  setAddressValue('#lastName', address.lastName);

  // 2. Preenche o CEP, o que vai engatilhar a chamada de API no background
  const zipInput = formEl.querySelector('#zipcode');
  if (!zipInput) {
    console.warn('[TM-Auto] Campo #zipcode não encontrado. Alguma estrutural mudou no formulário?');
    return;
  }

  // Desativar listener para evitar multiplos preenchimentos se o usuario clicar de novo enquanto processa
  const originalZipVal = zipInput.value;
  setAddressValue('#zipcode', address.zipcode);

  // 3. Máquina de Estado / Espera
  // A Ticketmaster desabilita os campos `province` e `city` enquanto bate o CEP ou trava via React.
  // Vamos ficar monitorando o campo '#street' ou '#city' para ver se ganharam valor, com timeout seguro de 2 a 3 segundos.

  let checks = 0;
  const maxChecks = 15; // 15 * 200ms = 3 segundos

  const checkApiReturn = setInterval(() => {
    checks++;
    const cityInput = formEl.querySelector('#city');
    const streetInput = formEl.querySelector('#street');
    
    // Critério de sucesso: o campo rua não esta disabled e ganhou um valor, ou a cidade ganhou um valor
    const isReady = (cityInput && cityInput.value !== '') || (checks >= maxChecks);

    if (isReady) {
      clearInterval(checkApiReturn);
      console.log(`[TM-Auto] Retorno da API concluído após ${checks * 200}ms ou via timeout.`);
      
      // 4. Preencher Número e Complemento (Ação humana imediata)
      setAddressValue('#number', address.number);
      if (address.complement) {
        setAddressValue('#addressLine2', address.complement);
      }

      // 5. Fallbacks (Rua e Bairro e Estado) - Injeta apenas se a API não os achou
      if (streetInput && !streetInput.value && address.street) {
        setAddressValue('#street', address.street);
      }
      
      const neighborhoodInput = formEl.querySelector('#neighborhood');
      if (neighborhoodInput && !neighborhoodInput.value && address.neighborhood) {
        setAddressValue('#neighborhood', address.neighborhood);
      }

      const cityCheckInput = formEl.querySelector('#city');
      if (cityCheckInput && !cityCheckInput.value && address.city) {
        setAddressValue('#city', address.city);
        // tenta remover disabled por seguranca caso o rect tenha travado
        cityCheckInput.removeAttribute('disabled');
      }
      
      const provinceInput = formEl.querySelector('#province');
      if (provinceInput && !provinceInput.value && address.state) {
        setAddressValue('#province', address.state);
        provinceInput.removeAttribute('disabled');
      }

      console.log('[TM-Auto] Formulário de cobrança preenchido. Finalizado! Aguardando o clique humano em "Continuar".');
    }
  }, 200);
}
