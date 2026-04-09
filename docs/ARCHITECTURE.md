# Arquitetura Técnica

## Estrutura de pastas

```
ticket-master-autocomplete/
├── manifest.json
├── background/
│   └── service-worker.js         # mensagens entre popup/content/options
├── content/
│   ├── content-script.js         # entrypoint injetado no Ticketmaster
│   ├── floating-button.js        # botão fixo + menu de seleção (Shadow DOM)
│   ├── filler.js                 # preenche inputs disparando eventos corretos
│   └── field-map.js              # rótulo lógico → seletor CSS
├── popup/
│   ├── popup.html
│   ├── popup.js                  # toggle on/off + link para options
│   └── popup.css
├── options/
│   ├── options.html              # CRUD de usuários e cartões
│   ├── options.js
│   └── options.css
├── shared/
│   ├── storage.js                # wrapper de chrome.storage.local
│   └── schema.js                 # factory de objetos + defaults
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## manifest.json — pontos-chave

```json
{
  "manifest_version": 3,
  "permissions": ["storage"],
  "host_permissions": [
    "https://*.ticketmaster.com.br/*"
  ],
  "content_scripts": [{
    "matches": ["https://*.ticketmaster.com.br/*"],
    "js": ["content/content-script.js"],
    "run_at": "document_idle"
  }],
  "action": { "default_popup": "popup/popup.html" },
  "background": { "service_worker": "background/service-worker.js" },
  "options_ui": {
    "page": "options/options.html",
    "open_in_tab": true
  }
}
```

> **Nota:** O content script roda em TODAS as páginas do ticketmaster.com.br mas só injeta
> o botão flutuante quando a URL bate com padrões conhecidos do checkout (ver CHECKOUT-ANALYSIS.md).

## Schema de dados (chrome.storage.local)

```js
{
  users: [
    {
      id: 'u1',                        // gerado com crypto.randomUUID()
      label: 'Victor',                 // nome exibido no menu
      personal: {
        fullName: '',
        cpf: '',                       // com máscara: 000.000.000-00
        birthDate: '',                 // DD/MM/AAAA
        email: '',
        phone: ''                      // com máscara: (11) 99999-9999
      },
      halfTicket: {
        type: 'Student',               // OldMan|LowIncomeYouth|Teachers|Retirees|Student|DisabledPerson
        cieNumber: '',
        expiration: '',                // MM/AAAA
        course: ''
      },
      billingAddress: {
        zipCode: '',                   // 00000-000
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''                      // sigla: SP, RJ, ...
      }
    }
  ],
  cards: [
    {
      id: 'c1',
      label: 'Nubank',
      number: '',                      // sem espaços
      holderName: '',
      expiration: '',                  // MM/AA
      cvv: ''
    }
  ],
  settings: {
    enabled: true
  }
}
```

## Preenchimento React-aware (filler.js)

O Ticketmaster usa React. `input.value = x` não dispara os listeners do React.
Solução: usar o nativeSetter do prototype + dispatch de eventos.

```js
function setInputValue(el, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype, 'value'
  ).set;
  nativeSetter.call(el, value);
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur',   { bubbles: true }));
}
```

Para `<select>`:
```js
function setSelectValue(el, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype, 'value'
  ).set;
  nativeSetter.call(el, value);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
```

Delay entre campos: ~30ms para evitar detecção de bot.

## Botão flutuante (floating-button.js)

- Usa **Shadow DOM** para isolar estilos do site
- `position: fixed`, canto inferior direito
- `z-index: 2147483647` (máximo)
- Menu exibe: lista de usuários + lista de cartões
- Ao selecionar combinação → dispara `fillForm(user, card)` no content-script

## Comunicação entre componentes

```
Options page  →  chrome.storage.local  ←  Content script
                                       ←  Popup

Popup  →  chrome.runtime.sendMessage  →  Background  →  chrome.tabs.sendMessage  →  Content script
```

O background service worker serve principalmente como relay para mensagens
que precisam cruzar contextos (popup → content script).
