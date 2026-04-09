# Roadmap Completo — Ticketmaster Autocomplete Extension

**Status geral:** Fase 0 ✅ Completa | Fase 1–7 📋 Planejadas
**Última atualização:** 2026-04-09

---

## Fase 0 — Reconhecimento (✅ COMPLETA)

**Data:** 2026-04-08 (concluída)
**Objetivo:** mapear todas as páginas, etapas e campos do checkout

### O que foi feito

✅ Identificadas URLs e padrões de checkout (SPA confirmado)
✅ Mapeadas 8 etapas principais (0, 0b, 0c, 0d, 1, 2, 3, 3b)
✅ Documentados todos os seletores CSS (16 tipos de meia-entrada capturados)
✅ **Alerta crítico:** Adyen usa iframes cross-origin → apenas cardholder name é preenchível
✅ Confirmado comportamento dinâmico de campos (extra-fields, state machine de holders)
✅ Mapeadas variantes (picker padrão vs picker com calendário Getcrowder)

### Entregáveis

- `CHECKOUT-ANALYSIS.md` — 311 linhas, todos os seletores, quirks, UI mockups
- `ARCHITECTURE.md` — esquema de dados, estrutura de pastas, comunicação entre componentes

---

## Fase 1 — Esqueleto Funcional + CRUD + Content Script Básico

**Objetivo:** base da extensão com opções page, detecção de etapas, injeção de botões
**Status:** 🔄 EM ANDAMENTO
**Deadline indicativo:** 2026-04-11

### Escopo

#### Implementar

**Estrutura base (5 arquivos)**
- `manifest.json` — Manifest V3, permissões, matches
- `shared/storage.js` — wrapper CRUD de `chrome.storage.local`
- `shared/schema.js` — factories de user/card
- `background/service-worker.js` — inicialização, relay de mensagens
- Icons placeholder (16/48/128px)

**Options page (3 arquivos)**
- `options/options.html` — 2 seções (usuários + cartões), forms, tabelas, export/import
- `options/options.js` — CRUD completo, renderização dinâmica
- `options/options.css` — estilos básicos

**Popup (3 arquivos)**
- `popup/popup.html` — botão "Abrir configurações" + status
- `popup/popup.js` — abrir options page, atualizar contador
- `popup/popup.css` — minimal

**Content script (4 arquivos)**
- `content/content-script.js` — entrypoint, MutationObserver no `#checkout-actions`
- `content/ui-injector.js` — `injectUserButtons()`, `injectCardButtons()` (inline HTML/CSS)
- `content/holder-filler.js` — `fillHolder(user, holderEl)`, `setInputValue()`, `waitForExtraFields()`, etc.
- `content/card-filler.js` — `fillCardHolder(card)`, preenche só `#card_holder_name`

#### Não implementar (deixar para fases posteriores)

- ❌ Endereço de cobrança
- ❌ Etapas intermediárias automáticas (seguro, entrega, termos)
- ❌ Botão flutuante com dropdown
- ❌ Toast/feedback visual
- ❌ Atalhos de teclado
- ❌ Tratamento de erro detalhado

### Tarefas por etapa

#### Etapa A — Fundação (5 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| A1 | Criar `manifest.json` | Carregar em `chrome://extensions` sem erros |
| A2 | Criar `shared/schema.js` — factories | Funções retornam objetos válidos |
| A3 | Criar `shared/storage.js` — CRUD | Ler/escrever em `chrome.storage.local` funciona |
| A4 | Criar `background/service-worker.js` | Storage inicializado na primeira instalação |
| A5 | Criar icons | PNG 16/48/128 presentes em `/icons` |

#### Etapa B — Options Page (10 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| B1 | `options/options.html` — layout | Form + tabela renderizam |
| B2 | `options/options.js` — load data | `getUsers()` + `getCards()` carregam ao abrir |
| B3 | CRUD usuários: add | Form submission → novo usuário salvo + tabela atualizada |
| B4 | CRUD usuários: edit | Botão editar → form preenchido → `updateUser()` |
| B5 | CRUD usuários: delete | Botão remover → usuário deletado |
| B6 | CRUD cartões: add | Form submission → novo cartão salvo + tabela atualizada |
| B7 | CRUD cartões: edit | Botão editar → form preenchido → `updateCard()` |
| B8 | CRUD cartões: delete | Botão remover → cartão deletado |
| B9 | Export/import JSON | Download e restauração de dados funcionam |
| B10 | `options/options.css` | Tabelas, forms, botões com estilo mínimo |

#### Etapa C — Popup (3 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| C1 | `popup/popup.html` | Botão + status renderizam |
| C2 | `popup/popup.js` | Botão abre options page; contador atualiza |
| C3 | `popup/popup.css` | Estilos básicos aplicados |

#### Etapa D — Content Script — Detecção e Injeção (7 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| D1 | `content/content-script.js` — entrypoint | MutationObserver ligado, detecta mudanças no `#checkout-actions` |
| D2 | `detectCheckoutStage()` | Identifica "Detalhes dos participantes" e "Insira os dados do seu cartão" pelo `h1` |
| D3 | `handleHolderStage()` | Quando `.holder-active` aparece, dispara injeção de toolbar |
| D4 | `handleCardStage()` | Quando Adyen form aparece, dispara injeção de toolbar |
| D5 | `content/ui-injector.js` — `injectUserButtons()` | Barra de botões injeta acima de `#firstName` com 1 botão por usuário |
| D6 | `content/ui-injector.js` — `injectCardButtons()` | Barra de botões injeta acima de `#card_holder_name` com 1 botão por cartão |
| D7 | Estilos inline dos botões | Azul, branco, padding, cursor pointer |

#### Etapa E — Content Script — Preenchimento de Holder (10 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| E1 | `content/holder-filler.js` — `fillHolder(user, holderEl)` | Orquestra todo o fluxo |
| E2 | `setInputValue()` — React-aware | Dispara `input`, `change`, `blur`; nativeSetter do prototype |
| E3 | `setSelectValue()` — para tipos de meia-entrada | Seleciona opção, dispara `change` |
| E4 | `delay(ms)` helper | Aguarda tempo especificado |
| E5 | Preencher campos comuns — `firstName`, `lastName`, `documentNumber` | ~30ms entre campos |
| E6 | Clicar tipo de meia-entrada | `div[data-type="..."] li.holder-option` é clicado |
| E7 | `waitForExtraFields()` — MutationObserver + 3s timeout | Aguarda filhos em `#extra-fields` antes de preencher |
| E8 | `fillExtraFields()` — Student type | dateOfBirth, CIE, validity, institution, city, state, course preenchidos |
| E9 | Clicar checkbox + save button | `input[name="confirmData"]` marcado, `#saveHolder` clicado |
| E10 | Ligar cliques dos botões a `fillHolder()` | Clicar botão preenche todos os campos |

#### Etapa F — Content Script — Preenchimento de Cartão (4 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| F1 | `content/card-filler.js` — `fillCardHolder(card)` | Preenche apenas `#card_holder_name` |
| F2 | Reusar `setInputValue()` | Helper compartilhado entre modules |
| F3 | Ligar cliques dos botões a `fillCardHolder()` | Clicar botão preenche cardholder name |
| F4 | Console.log feedback | "Preencher número, validade e CVV manualmente" |

#### Etapa G — Testes E2E (7 tasks)

| # | Tarefa | Verificação |
|---|--------|-------------|
| G1 | Test: carregar extensão, abrir options | Sem erros console |
| G2 | Test: CRUD completo — adicionar, editar, remover | Dados persistem após reload |
| G3 | Test: popup + contador | "2 usuários · 2 cartões" correto |
| G4 | Test: holder com Student type | Nome, CPF, tipo, extras preenchidos; holder → `.holder-ok` |
| G5 | Test: múltiplos holders | Barra injeta para cada novo `.holder-active` |
| G6 | Test: cartão Adyen | Cardholder name preenchido; número/validade/CVV vazios |
| G7 | Test: console limpo | Sem erros, sem warnings (remover logs de debug) |

### Checklist de conclusão (Fase 1)

- [ ] Todos os 8 grupos de tarefas (A–G) completados
- [ ] Extensão carrega sem erros em `chrome://extensions`
- [ ] Options page: CRUD funciona, export/import funciona
- [ ] Popup: abre, contador correto
- [ ] Content script: detecta ambas as etapas (holder + Adyen)
- [ ] Holder filling: Student type com todos os extras
- [ ] Card filling: cardholder name apenas
- [ ] E2E: múltiplos holders, múltiplos cartões, sem erros

---

## Fase 2 — Endereço de Cobrança

**Objetivo:** preencher formulário de endereço quando conta não tem salvo
**Status:** ⏳ Pendente
**Estimado:** após Fase 1

### Escopo

- Detectar etapa 0d (h1 = "Novo endereço de cobrança")
- Injetar barra de botões com endereços pré-cadastrados
- `content/address-filler.js` — preencher CEP, aguardar lookup automático, preencher demais campos
- Campos: firstName, lastName, zipCode, state (auto), city (auto), neighborhood, street, number, complement

### Decisões pendentes

- Armazenar múltiplos endereços (1:1 com usuário ou lista separada)?
- Quando endereço aparece inline no Adyen form, como diferenciar da etapa separada?

---

## Fase 3 — Etapas Intermediárias Automáticas

**Objetivo:** auto-navegação em etapas sem formulário (seguro, entrega, termos, confirmação)
**Status:** ⏳ Pendente
**Estimado:** após Fase 2

### Escopo

- **Etapa 0 (Seguro):** auto-clicar `#removeInsurance` + botão `next` (ou deixar usuário decidir)
- **Etapa 0b (Termos):** auto-clicar botão de aceite
- **Etapa 0c (Entrega):** auto-clicar primeira opção de entrega
- **Etapa 2 (Confirmação):** pausar e exibir mensagem (⚠️ reserva efetiva), ou auto-clicar `#confirmCheckout` se usuário autorizou

### Configuração

- Adicionar toggle de automação na options page para cada etapa (on/off)
- Padrão: tudo OFF (seguro, termos automáticos); Confirmação OFF e com pause

---

## Fase 4 — Toast / Feedback Visual

**Objetivo:** informar usuário sobre sucesso/falha de preenchimento
**Status:** ⏳ Pendente
**Estimado:** após Fase 3

### Escopo

- Toast inline (canto inferior direito) com animação fade
- Mensagens:
  - ✅ "Campos preenchidos: 8 de 8"
  - ⚠️ "Campo não encontrado: institution"
  - ℹ️ "Preencher número, validade e CVV manualmente"
- Auto-desaparecer em 4s ou clicar para fechar
- CSS animação + cleanup no DOM

---

## Fase 5 — Botão Flutuante com Dropdown

**Objetivo:** UI alternativa ao botão de toolbar (opcional, pode remover)
**Status:** ⏳ Pendente
**Estimado:** após Fase 4

### Escopo

- Botão fixo `position: fixed`, canto inferior direito, z-index máximo
- Shadow DOM para isolar estilos
- Click → dropdown com 2 seções: "Usuários" + "Cartões"
- Comportamento: mesmo que botões da toolbar, mas sempre visível

### Decisão

- Descartar se a experiência de toolbar for suficiente

---

## Fase 6 — Atalhos de Teclado

**Objetivo:** preencher com `Alt+1`, `Alt+2`, etc.
**Status:** ⏳ Pendente
**Estimado:** após Fase 5

### Escopo

- Registrar commands no manifest: `alt+1`, `alt+2`, etc.
- Cada atalho dispara preenchimento com usuário/cartão correspondente
- Função: `chrome.commands.onCommand` listener no content script

### Configuração

- Opcional, desativado por padrão
- Usuário ativa na options page se quiser

---

## Fase 7 — Polimento e Edge Cases

**Objetivo:** estabilidade, UX refinement, fallbacks
**Status:** ⏳ Pendente
**Estimado:** após Fase 6

### Escopo

- Tratamento de erros detalhado (campo ausente, seletor quebrado → log + toast)
- Fallback por `label`/`placeholder` se seletor CSS não encontre campo
- Sincronização de estado entre popup e content script via `chrome.storage.onChanged`
- Validação de dados (CPF format, card number length, etc.) no options page
- Regex para máscaras (CPF, telefone, CEP)
- Limpeza de DOM ao desinstalar extensão (remover toolbars)
- Performance: debounce MutationObserver

### Decisão

- Implementar incrementalmente conforme bugfreports surgirem durante testes

---

## Visão Geral de Arquivos (7 fases)

```
ticket-master-autocomplete/
├── manifest.json
├── background/
│   └── service-worker.js              # Fase 1
├── content/
│   ├── content-script.js              # Fase 1
│   ├── ui-injector.js                 # Fase 1
│   ├── holder-filler.js               # Fase 1
│   ├── card-filler.js                 # Fase 1
│   ├── address-filler.js              # Fase 2 (new)
│   └── intermediate-stages.js         # Fase 3 (new)
├── popup/
│   ├── popup.html                     # Fase 1
│   ├── popup.js                       # Fase 1, update Fase 3
│   └── popup.css                      # Fase 1
├── options/
│   ├── options.html                   # Fase 1, update Fase 2
│   ├── options.js                     # Fase 1, update Fase 2, 3
│   └── options.css                    # Fase 1
├── shared/
│   ├── storage.js                     # Fase 1
│   └── schema.js                      # Fase 1
├── icons/
│   ├── icon-16.png                    # Fase 1
│   ├── icon-48.png                    # Fase 1
│   └── icon-128.png                   # Fase 1
├── docs/
│   ├── CHECKOUT-ANALYSIS.md           # Fase 0 ✅
│   ├── ARCHITECTURE.md                # Fase 0 ✅
│   ├── PROJECT-ROADMAP.md             # Este arquivo
│   └── README.md                      # Existing
└── [desenvolvimento...]
```

---

## Timeline Estimada

| Fase | Descrição | Duração | Início | Fim |
|------|-----------|---------|--------|-----|
| 0 | Reconhecimento | ✅ Completa | 2026-04-08 | 2026-04-09 |
| 1 | Esqueleto + CRUD + Content Script | 4 dias | 2026-04-09 | 2026-04-13 |
| 2 | Endereço de cobrança | 2 dias | 2026-04-13 | 2026-04-15 |
| 3 | Etapas intermediárias | 2 dias | 2026-04-15 | 2026-04-17 |
| 4 | Toast/feedback | 1 dia | 2026-04-17 | 2026-04-18 |
| 5 | Botão flutuante | 2 dias | 2026-04-18 | 2026-04-20 |
| 6 | Atalhos de teclado | 1 dia | 2026-04-20 | 2026-04-21 |
| 7 | Polimento | 2 dias | 2026-04-21 | 2026-04-23 |
| **Total** | | **14 dias** | | 2026-04-23 |

---

## Decisões Arquiteturais Globais

| Decisão | Escolha | Raciocínio |
|---------|---------|-----------|
| Framework | Vanilla JS + Manifest V3 | Sem build step, sem dependências |
| Storage | `chrome.storage.local` plaintext | Usuário aceitou trade-off segurança/conveniência |
| Modelo de dados | Usuários e cartões listas independentes | Qualquer combinação user+card |
| UI de seleção (Fase 1) | Botões inline por etapa | Simples, direto, sem dropdown |
| UI de seleção (Fase 5, opcional) | Botão flutuante com dropdown | Sempre visível, não obstrutivo |
| Dados sensíveis | CVV armazenado | Sugestão: full-disk encryption + lock screen |
| Cross-origin iframes | Aceitar limitação | Sem debugger API, sem hacks invasivos |
| Validação | Mínima em Fase 1, incrementada em Fase 7 | Iterativo, baseado em bugs reais |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Ticketmaster atualiza seletores CSS | Alto | `field-map.js` centralizado; fallback por label/placeholder (Fase 7) |
| React ignora `input.value = x` | Médio | nativeSetter + event dispatch comprovado funcionar |
| Campos dinâmicos aparecem lentamente | Médio | MutationObserver + timeout (não hang indefinidamente) |
| Anti-bot bloqueia preenchimento muito rápido | Baixo | Delay ~30ms entre campos, eventos como humano |
| Adyen iframes impedem filling de cartão | Alto | Aceito, preencher cardholder name apenas |
| Múltiplos eventos MutationObserver competem | Médio | Limpar observers antigos antes de criar novos |
| Storage corrompido durante update | Baixo | Export/import manual em Fase 1; backup automático em Fase 7 (opcional) |

---

## Como usar este documento

1. **Para começar Fase 1:** ler seção "Fase 1", especialmente "Tarefas por etapa"
2. **Para atualizar progresso:** marcar tasks completadas na tabela
3. **Para planejar próxima fase:** ler seção correspondente + roadmap global
4. **Para decisões arquiteturais:** consultar "Decisões Arquiteturais Globais" e "Riscos"

---

**Última revisão:** 2026-04-09 (Fase 0 completa, Fase 1 em planejamento)

