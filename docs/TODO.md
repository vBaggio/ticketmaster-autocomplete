# TODO — Progress Tracker

**Fase atual:** 1 (Esqueleto + CRUD + Content Script)
**Última atualização:** 2026-04-09

---

## Fase 1 — Etapa A (Fundação) ✅

- [x] A1 — `manifest.json` 
- [x] A2 — `shared/schema.js` 
- [x] A3 — `shared/storage.js` 
- [x] A4 — `background/service-worker.js` 
- [x] A5 — Icons placeholder

**Status:** 5/5 ✅

---

## Fase 1 — Etapa B (Options Page) ✅

- [x] B1 — `options/options.html` layout
- [x] B2 — `options/options.js` load data
- [x] B3 — CRUD usuários: add
- [x] B4 — CRUD usuários: edit
- [x] B5 — CRUD usuários: delete
- [x] B6 — CRUD cartões: add
- [x] B7 — CRUD cartões: edit
- [x] B8 — CRUD cartões: delete
- [x] B9 — Export/import JSON
- [x] B10 — `options/options.css`

**Status:** 10/10 ✅

---

## Fase 1 — Etapa C (Popup) ✅

- [x] C1 — `popup/popup.html`
- [x] C2 — `popup/popup.js`
- [x] C3 — `popup/popup.css`

**Status:** 3/3 ✅

---

## Fase 1 — Etapa D (Content Script — Detecção) ✅

- [x] D1 — `content/content-script.js` entrypoint
- [x] D2 — `detectCheckoutStage()`
- [x] D3 — `handleHolderStage()`
- [x] D4 — `handleCardStage()`
- [x] D5 — `content/ui-injector.js` — `injectUserButtons()`
- [x] D6 — `content/ui-injector.js` — `injectCardButtons()`
- [x] D7 — Estilos inline dos botões

**Status:** 7/7 ✅

---

## Fase 1 — Etapa E (Content Script — Holder Filling) ✅

- [x] E1 — `content/holder-filler.js` — `fillHolder()`
- [x] E2 — `setInputValue()` React-aware
- [x] E3 — `setSelectValue()`
- [x] E4 — `delay()` helper
- [x] E5 — Preencher campos comuns
- [x] E6 — Clicar tipo de meia-entrada
- [x] E7 — `waitForExtraFields()`
- [x] E8 — `fillExtraFields()` Student type
- [x] E9 — Clicar checkbox + save button
- [x] E10 — Ligar cliques dos botões

**Status:** 10/10 ✅

---

## Fase 1 — Etapa F (Content Script — Card Filling) ✅

- [x] F1 — `content/card-filler.js` — `fillCardHolder()`
- [x] F2 — Reusar `setInputValue()`
- [x] F3 — Ligar cliques dos botões
- [x] F4 — Console.log feedback

**Status:** 4/4 ✅

---

## Fase 1 — Etapa G (Testes E2E)

- [ ] G1 — Test: carregar extensão, options page
- [ ] G2 — Test: CRUD completo
- [ ] G3 — Test: popup + contador
- [ ] G4 — Test: holder Student type
- [ ] G5 — Test: múltiplos holders
- [ ] G6 — Test: cartão Adyen
- [ ] G7 — Test: console limpo

**Status:** 0/7

---

## Fase 1 — Resumo

| Etapa | Status | Tasks |
|-------|--------|-------|
| A | ✅ 100% | 5/5 |
| B | ✅ 100% | 10/10 |
| C | ✅ 100% | 3/3 |
| D | ✅ 100% | 7/7 |
| E | ✅ 100% | 10/10 |
| F | ✅ 100% | 4/4 |
| G | 0% | 0/7 |
| **Total** | **85%** | **39/46** |

---

## Próximas fases (referência)

- **Fase 2** — Endereço de cobrança
- **Fase 3** — Etapas intermediárias automáticas
- **Fase 4** — Toast/feedback visual
- **Fase 5** — Botão flutuante com dropdown
- **Fase 6** — Atalhos de teclado
- **Fase 7** — Polimento e edge cases

Ver `PROJECT-ROADMAP.md` para detalhes completos de cada fase.
