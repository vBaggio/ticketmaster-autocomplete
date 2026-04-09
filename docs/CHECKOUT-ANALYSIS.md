# Análise do Checkout — Ticketmaster Brasil

Documento vivo: atualizado conforme recebemos HTML de cada etapa (Fase 0).

## URLs conhecidas

| Página | URL | Status |
|--------|-----|--------|
| Evento / seleção de ingressos | `https://www.ticketmaster.com.br/event/[slug]` | ✅ Analisada |
| Checkout (todas as etapas) | Mesma URL do evento (SPA confirmado) | ✅ Confirmado |

> **SPA confirmado:** a URL não muda entre etapas do checkout. O content script não pode usar mudança de URL para detectar etapas — precisa observar o DOM (MutationObserver) para identificar qual etapa está ativa.

## Arquitetura do site

- Framework: Backbone/Rendr (não React puro) — renderização server-side + hidratação client-side
- Anti-bot: AWS WAF + Cloudflare Turnstile (CAPTCHA)
- SPA: sim, navegação entre etapas do checkout provavelmente não muda a URL completa

---

## Página de evento (`/event/[slug]`)

**Analisada em:** 2026-04-08
**HTML enviado pelo usuário:** sim

### Variante A — Picker padrão Ticketmaster (ex: shows, festivais)

- Seleção de setor e tipo de ingresso (Pista, Frontstage, Camarote)
- Tipos de ingresso com `holderConfiguration` para meia-entrada
- Nenhum campo de formulário pessoal — apenas ticket picker

### Variante B — Picker com calendário (ex: BBB Experience — Getcrowder)

Alguns eventos usam um widget customizado da Getcrowder com etapas sequenciais de seleção **antes** do checkout. A extensão **não interage** com esta fase — é seleção intencional do usuário.

| Etapa | Elementos | Seletor CSS |
|-------|-----------|-------------|
| 01 — Selecionar data | Dias clicáveis | `div.cal-day.cal-active[data-value="YYYY-MM-DD"]` |
| 02 — Selecionar horário | Slots clicáveis | `div.cal-hour.cal-hour-active[data-value]` |
| 03 — Selecionar setor/tipo | Botões `+`/`-` por tipo | `.additional-item .btn-number.plus` / `.btn-number.minus` |
| Continuar | Botão que abre o checkout | `button#continue` (fica `display:none` até seleção) |

**Impacto na extensão:** independente da variante, o checkout começa quando `#checkout-actions` passa a ter conteúdo. O content script deve observar `#checkout-actions` via MutationObserver e só ativar o fluxo de preenchimento quando houver etapa ativa.

### O que tem nesta página (Variante A)

### Gateways de pagamento (extraído do JSON embutido)

```json
[
  { "type": "PixConfiguration",       "scope": "LOCAL",   "name": "PIX" },
  { "type": "MercadoPagoConfiguration","scope": "FOREIGN", "name": "Credit Card" },
  { "type": "AdyenConfiguration",     "scope": "LOCAL",   "name": "Cartão de Crédito",
    "publicKey": "live_42LJ2CAZOZC3FNPWFESFYVBW642CST7L" }
]
```

### ⚠️ Alerta crítico: Adyen e iframes

O gateway de cartão LOCAL é **Adyen**. A Adyen renderiza os campos de cartão
(número, validade, CVV) dentro de **iframes cross-origin**.

Content scripts **não conseguem** preencher campos dentro de iframes cross-origin —
é uma restrição de segurança do browser (Same-Origin Policy).

**Impacto:** preenchimento automático do cartão pode ser inviável.

**Estratégias possíveis:**
1. ✅ Verificar se este site usa Adyen Drop-in (iframes) ou Adyen Custom Cards (inputs normais) — **precisamos do HTML do checkout para confirmar**
2. ❌ Content script direto em iframe cross-origin — bloqueado pelo browser
3. ⚠️ Interceptar SDK Adyen via `world: "MAIN"` antes de inicializar — muito frágil
4. ⚠️ `chrome.debugger` API — funciona mas desativa DevTools e é invasivo
5. ✅ Fallback: preencher tudo exceto campos do Adyen, usuário digita cartão manualmente

### Tipos de meia-entrada suportados

```
OldMan          → Maiores de 60 anos
LowIncomeYouth  → Jovens de baixa renda
Teachers        → Profissionais das Redes Públicas de Ensino
Retirees        → Aposentados
Student         → Estudantes (CIE)
DisabledPerson  → Pessoas com Deficiência
```

A carteirinha CIE só é relevante para o tipo `Student`.

### Configuração relevante

```json
"requireBillingAddress": true
```
Confirma que o endereço de cobrança é obrigatório em todos os pedidos.

---

## Etapas do checkout

> **Seção a preencher conforme o usuário enviar HTML de cada etapa.**

### Etapa 0 — Seguro do ingresso (intermediária, sem formulário)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

Esta etapa é um upsell de seguro — **não tem campos de formulário**. Apenas dois botões de escolha e um botão de continuar.

| Elemento | Seletor CSS | Observação |
|----------|-------------|------------|
| Aceitar seguro | `li#addInsurance` | Clicar seleciona a opção |
| Recusar seguro | `li#removeInsurance` | Clicar seleciona a opção |
| Continuar | `a.btn.btn-primary.btn-block.next` dentro de `.options-cart.process_action` | Avança para próxima etapa |

**Container da etapa:** `.checkout-actions#checkout-actions[data-view="event/checkout_summary"]`

**Estratégia da extensão:** auto-clicar `#removeInsurance` + `.next` para pular esta etapa, ou deixar o usuário decidir manualmente. Implementar como opção configurável.

---

### Etapa 0c — Método de entrega (intermediária, sem formulário)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

Seleção do método de entrega do ingresso — **sem campos de formulário**. Apenas opção(ões) clicáveis. Neste evento, somente uma opção disponível (Quentro Digital).

| Elemento | Seletor CSS | Observação |
|----------|-------------|------------|
| Opção Quentro Digital | `li.delivery-select[data-id="QUENTRO"]` | Clicar seleciona e provavelmente auto-avança |

**Identificar etapa:** `#checkout-actions h1` com texto `"Selecione o método de entrega abaixo"`

**Estratégia da extensão:** auto-clicar `li.delivery-select` (primeira opção disponível) ao detectar esta etapa.

> **Nota:** Pode haver eventos com múltiplas opções de entrega. Por simplicidade, clicar na primeira `li.delivery-select` é suficiente.

---

### Etapa 0d — Endereço de cobrança (aparece quando conta não tem endereço salvo)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

**Identificar etapa:** `#checkout-actions h1` com texto `"Novo endereço de cobrança"` ou `#checkout-actions[data-title="Novo endereço de cobrança"]`

Esta etapa **só aparece** quando a conta Ticketmaster não possui endereço de cobrança salvo. Quando há endereço salvo, o site exibe apenas o resumo na Etapa 2 ("Confirme a operação").

#### Campos do formulário

Escopo: `#checkout-actions form`

| Rótulo lógico   | Seletor CSS    | Name attr      | Tipo   | Observação |
|-----------------|----------------|----------------|--------|------------|
| `firstName`     | `#firstName`   | `firstName`    | `input[type=text]` | Nome |
| `lastName`      | `#lastName`    | `lastName`     | `input[type=text]` | Sobrenome |
| `zipCode`       | `#zipcode`     | `zipCode`      | `input[type=text]` | CEP — disparar `blur` para auto-complete |
| `state`         | `#province`    | `province`     | `input[type=text]` | **`disabled` inicial** — preenchido pelo site após lookup do CEP |
| `city`          | `#city`        | `city`         | `input[type=text]` | **`disabled` inicial** — preenchido pelo site após lookup do CEP |
| `neighborhood`  | `#neighborhood`| `neighborhood` | `input[type=text]` | Bairro |
| `street`        | `#street`      | `street`       | `input[type=text]` | Rua/Logradouro |
| `streetNumber`  | `#number`      | `streetNumber` | `input[type=text]` | Número |
| `complement`    | `#addressLine2`| `additionalInfo`| `input[type=text]` | Apartamento/Complemento — opcional |

#### Botões

| Ação | Seletor CSS | Observação |
|------|-------------|------------|
| Voltar | `a#back_to_options` | — |
| Continuar | `a#createAddress.btn.btn-primary` | Inicia `disabled` — habilitado quando formulário válido |

#### Fluxo de preenchimento

1. Preencher `#firstName` e `#lastName`
2. Preencher `#zipcode` + disparar `blur` → site faz lookup e preenche `#province` e `#city` automaticamente
3. Aguardar `#province` e `#city` ficarem **habilitados** (MutationObserver no atributo `disabled`)
4. Preencher `#neighborhood`, `#street`, `#number`, `#addressLine2`
5. Clicar `#createAddress` (só estará habilitado após todos os campos obrigatórios preenchidos)

> **Nota:** `#province` e `#city` ficam `disabled` e são preenchidos via API de CEP pelo próprio site. Aguardar ~1s após o `blur` do CEP antes de preencher os demais campos.

> **Nota sobre localização:** este formulário pode aparecer em dois momentos distintos do fluxo: (a) como etapa separada entre entrega e termos (visto no BBB Experience); (b) inline dentro da etapa de seleção de método de pagamento (Etapa 3 do fluxo padrão, onde `#checkout-actions[data-title="Novo endereço de cobrança"]` já foi observado). Em ambos os casos o identificador é o mesmo: `h1` = "Novo endereço de cobrança" e os seletores são idênticos. O content script deve tratar os dois contextos com a mesma lógica de preenchimento.

---

### Etapa 0b — Termos e Condições (intermediária, sem formulário)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

Texto de aceite de termos — **sem campos de formulário**. Apenas um botão de confirmação.

| Elemento | Seletor CSS | Observação |
|----------|-------------|------------|
| Botão "Eu aceito" | `a.btn.btn-primary.btn-block.next` | Mesmo seletor da etapa 0 — discriminar pela `h1` do container |

**Identificar etapa:** `#checkout-actions h1` com texto `"Termos e Condições"`

**Estratégia da extensão:** auto-clicar o botão ao detectar esta etapa ativa.

---

### Etapa 1 — Detalhes dos participantes (holder por ingresso)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

Um formulário por ingresso de **meia-entrada** no carrinho. Ingressos inteiros **não geram holder form** e não aparecem aqui. Cada holder é preenchido sequencialmente: o ativo tem classe `.holder-active`, os demais `.holder-inactive`.

**Identificar etapa:** `#checkout-actions h1` com texto `"Detalhes dos participantes"`

#### ⚠️ IDs duplicados — escopo obrigatório

`#firstName`, `#lastName`, `#holderForm`, `#saveHolder` etc. aparecem uma vez por ingresso. **Todo seletor deve ser escopado em `.holder-active`**, ex: `.holder-active #firstName`.

#### ⚠️ `#extra-fields` é preenchido dinamicamente

No holder inativo, `#extra-fields` é um `<div>` **vazio**. Os campos extras só são injetados no DOM **após** clicar no tipo de meia-entrada (`li.holder-option`). O filler deve aguardar `#extra-fields` ter filhos antes de tentar preencher (MutationObserver ou polling com timeout).

#### `#buttonsCard` aparece só no final

O botão "Confirmar os participantes" fica com `display: none` até que todos os holders sejam salvos. Não tentar clicar antes.

#### Estados dos holders

| Classe CSS     | Significado |
|----------------|-------------|
| `.holder-inactive` | Aguardando — bloqueado até o anterior ser salvo |
| `.holder-active`   | Ativo — pronto para preencher |
| `.holder-ok`       | Salvo com sucesso — título atualizado com nome + CPF |

#### Fluxo de preenchimento por holder

1. Detectar `.holder-active`
2. Clicar na `li.holder-option` correspondente ao tipo dentro de `.holder-active div[data-type="<tipo>"]`
3. Aguardar `#extra-fields` ter filhos (MutationObserver) — indica que os campos extras foram injetados
4. Preencher campos comuns (`#firstName`, `#lastName`, `#documentNumber`)
5. Preencher campos extras do tipo (escopo: `.holder-active #extra-fields`)
6. Marcar o checkbox `input[name="confirmData"]` com `click()`
7. Clicar `.holder-active #saveHolder`
8. Aguardar: holder atual troca de `.holder-active` para `.holder-ok` (MutationObserver na classList)
9. Repetir do passo 1 para o próximo `.holder-active` (se houver)
10. Quando todos salvos → `#buttonsCard` aparece → clicar `#buttonsCard a.btn.btn-primary.btn-block.next`

#### Selecionar tipo de meia-entrada

| Tipo (data-type)  | Texto exibido |
|-------------------|---------------|
| `Student`         | Estudantes de ensino fundamental, médio ou superior |
| `DisabledPerson`  | Pessoas com Deficiência |
| `LowIncomeYouth`  | Jovens pertencentes a famílias de Baixa Renda |
| `Teachers`        | Professores e/ou Profissionais da Educação |
| `OldMan`          | Maiores de 60 Anos |
| `Retirees`        | Aposentados |

**Seletor do tipo:** `.holder-active div[data-type="<tipo>"] li.holder-option`

#### Campos comuns (todos os tipos)

Escopo: `.holder-active #holderForm`

| Rótulo lógico | Seletor CSS       | Tipo      | Observação |
|---------------|-------------------|-----------|------------|
| `firstName`   | `#firstName`      | `input`   | Nome |
| `lastName`    | `#lastName`       | `input`   | Sobrenome |
| `documentType`| `#documentType`   | `select`  | Fixo em CPF |
| `cpf`         | `#documentNumber` | `input`   | `im-insert="true"` — máscara automática |

#### Campos extras — tipo `Student`

Escopo: `.holder-active #extra-fields` (renderizado via `data-path="student"`)

| Rótulo lógico    | Seletor CSS        | Tipo     | Observação |
|------------------|--------------------|----------|------------|
| `birthDate`      | `#dateOfBirth`     | `input`  | DD/MM/AAAA, `im-insert="true"` |
| `cieNumber`      | `#CIE`             | `input`  | Número da carteirinha |
| `cieExpiration`  | `#validityDate`    | `input`  | `im-insert="true"` |
| `institution`    | `#institutionName` | `input`  | Nome da instituição |
| `city`           | `#city`            | `input`  | Cidade |
| `state`          | `#state`           | `select` | Sigla do estado |
| `course`         | `#course`          | `input`  | Nome do curso |
| *(confirmação)*  | `input[name="confirmData"]` | `checkbox` | Declaração legal — obrigatório marcar |

> **Nota:** campos extras dos outros tipos (`OldMan`, `Retirees`, `Teachers`, `LowIncomeYouth`, `DisabledPerson`) não foram capturados neste HTML pois o holder ativo estava renderizando o path `Student`. Será necessário capturar HTMLs adicionais ao selecionar os outros tipos.

#### DisabledPerson — acompanhante

Para `DisabledPerson` aparece `#holder-companion-group` com formulário de acompanhante:
- `#firstNameCompanion`, `#lastNameCompanion`, `#documentNumberCompanion`
- `#disabledConfirmData` (checkbox de declaração)

#### Botões

| Ação | Seletor CSS | Observação |
|------|-------------|------------|
| Salvar holder atual | `.holder-active #saveHolder` | Clicar após preencher cada holder |
| Confirmar todos | `#buttonsCard a.btn.btn-primary.btn-block.next` | Só aparece (`display: block`) após todos os holders salvos |

### Etapa 2 — Confirmação da reserva (sem formulário)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

Etapa intermediária antes do pagamento. **Sem campos de formulário**. Exibe resumo do pedido e endereço de cobrança já preenchido da conta.

**Identificar etapa:** `#checkout-actions h1` com texto `"Confirme a operação"`

| Elemento | Seletor CSS | Observação |
|----------|-------------|------------|
| Endereço de cobrança (display) | `.billing-adress span` | Texto informativo, **não é input** — vem da conta |
| Gerenciar endereços | `#modifyBillingAddress` | Link para conta — não usado pelo filler |
| Optin marketing (opcional) | `#optin` | Checkbox opcional, extensão ignora |
| **Confirmar reserva** | `#confirmCheckout` | **CTA principal — reserva os ingressos** |

> **Importante:** clicar em `#confirmCheckout` efetivamente reserva os ingressos. A extensão deve pausar aqui e exibir confirmação para o usuário antes de prosseguir, ou auto-clicar apenas se o usuário habilitou modo automático total.

> **Endereço de cobrança:** pré-preenchido da conta Ticketmaster. **Não há formulário de endereço nesta etapa.** Se a conta não tiver endereço salvo, pode haver um formulário — não confirmado.

> **Loading entre etapas:** o site exibe tela de carregamento ao transitar entre etapas. O content script deve usar MutationObserver no `#checkout-actions h1` para detectar a etapa ativa após o loading completar.

### Etapa 3 — Seleção do método de pagamento (sem formulário)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

**Identificar etapa:** `#checkout-actions h1` com texto `"Selecione a forma de pagamento"`

Dois métodos disponíveis neste evento:

| Método | Seletor CSS | data-id |
|--------|-------------|---------|
| PIX | `li.payment_method#pm_37` | `37` |
| Cartão de Crédito | `li.payment_method#pm_53` | `53` |

**Estratégia da extensão:** clicar em `#pm_53` (Cartão de Crédito) automaticamente, pois o usuário terá um cartão cadastrado.

> **Nota:** o container `#checkout-actions` nesta etapa tem `data-title="Novo endereço de cobrança"` — sugere que, ao selecionar o método, o site pode exibir formulário de endereço de cobrança se a conta não tiver um salvo. Cenário a confirmar.

### Etapa 3b — Formulário Adyen (Cartão de Crédito)

**Analisada em:** 2026-04-08
**HTML recebido:** ✅ Sim

**Identificar etapa:** `#checkout-actions h1` com texto `"Insira os dados do seu cartão"`

**Container:** `#adyenStep`

#### ⚠️ Alerta crítico CONFIRMADO: Adyen Drop-in com iframes cross-origin

O checkout usa **Adyen Drop-in** — os campos de cartão são renderizados dentro de iframes servidos de `checkoutshopper-live.adyen.com`. Content scripts **não conseguem** acessar o interior desses iframes (Same-Origin Policy).

| Rótulo lógico | Seletor CSS | Tipo | Em iframe? | Pode preencher? |
|----------------|-------------|------|------------|-----------------|
| `cardHolder`   | `#card_holder_name` | `input[type=text]` | ❌ Não | ✅ **Sim** |
| `cardNumber`   | `span[data-cse="encryptedCardNumber"]#card_number` | iframe | ✅ Sim | ❌ **Não** |
| `cardExpiry`   | `span[data-cse="encryptedExpiryDate"]#card_expiration_year` | iframe | ✅ Sim | ❌ **Não** |
| `cardCvv`      | `span[data-cse="encryptedSecurityCode"]#security_code` | iframe | ✅ Sim | ❌ **Não** |

**Botão pagar:** `input[type=submit]#payButton` — fica `disabled` até o Adyen validar os campos do cartão internamente.

**Estrutura dos iframes:**

```html
<!-- Titular do cartão — input normal, preenchível -->
<input id="card_holder_name" type="text" autocomplete="cc-name">

<!-- Número do cartão — iframe cross-origin -->
<span data-cse="encryptedCardNumber" id="card_number">
  <iframe src="https://checkoutshopper-live.adyen.com/checkoutshopper/securedfields/live_42LJ2CAZOZC3FNPWFESFYVBW642CST7L/4.9.0/securedFields.html?type=card&..."></iframe>
</span>

<!-- Validade — iframe cross-origin -->
<span data-cse="encryptedExpiryDate" id="card_expiration_year">
  <iframe src="https://checkoutshopper-live.adyen.com/..."></iframe>
</span>

<!-- CVV — iframe cross-origin -->
<span data-cse="encryptedSecurityCode" id="security_code">
  <iframe src="https://checkoutshopper-live.adyen.com/..."></iframe>
</span>
```

**Estratégia da extensão:**
- ✅ Preencher `#card_holder_name` automaticamente com `holderName` do cartão salvo
- ❌ Campos de número, validade e CVV: **usuário preenche manualmente**
- Extensão pode exibir os dados do cartão em overlay/toast para o usuário copiar facilmente

---

## Como extrair o HTML de cada etapa

1. Navegue até a etapa no Ticketmaster (você precisa estar logado e ter ingresso no carrinho)
2. Abra DevTools (F12)
3. Clique na aba **Elements**
4. Localize o `<form>` ou a `<div>` raiz da seção de formulário
5. Clique com botão direito → **Copiar** → **Copiar outerHTML**
6. Cole aqui na conversa junto com a URL da página

---

## UI da extensão no checkout

### Barra de botões de usuários (Etapa 1 — Detalhes dos participantes)

**Quando aparece:** detectar `.holder-active` no DOM (MutationObserver no `#checkout-actions`)

**Onde aparece:** topo do formulário do holder, antes de `#firstName` — inserir `<div id="extension-users-toolbar">` como primeiro filho de `.holder-active`

**Conteúdo:** um botão por usuário cadastrado, em linha horizontal
- Botão: `<button class="extension-user-btn" data-user-id="u1">Victor</button>`
- Texto: label do usuário (ex: "Victor")
- Comportamento ao clicar: chamar `filler.js` → `fillHolder(user, activeHolderEl)`

### Barra de botões de cartões (Etapa 3b — Formulário Adyen)

**Quando aparece:** detectar `h1` = "Insira os dados do seu cartão" no `#checkout-actions`

**Onde aparece:** topo do formulário, antes de `#card_holder_name` — inserir `<div id="extension-cards-toolbar">`

**Conteúdo:** um botão por cartão cadastrado, em linha horizontal
- Botão: `<button class="extension-card-btn" data-card-id="c1">Nubank</button>`
- Texto: label do cartão (ex: "Nubank")
- Comportamento ao clicar: chamar `filler.js` → `fillCardHolder(card)`

---

## Quirks e observações técnicas

- **Delay entre campos:** usar ~30ms para não parecer bot
- **CEP auto-complete:** ao preencher o CEP e disparar `blur`, o site provavelmente
  busca o endereço automaticamente. Aguardar ~1s antes de preencher os demais campos
  do endereço.
- **MutationObserver:** campos do checkout podem aparecer dinamicamente.
  O filler deve aguardar o campo existir no DOM antes de tentar preencher.
- **Barra de botões:** deve ser injetada dinamicamente ao detectar a etapa ativa. Usar `MutationObserver` para remontar a barra sempre que um novo holder fica `.holder-active`.
