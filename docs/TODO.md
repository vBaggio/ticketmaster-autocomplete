# TODO — Progress Tracker

**Fase atual:** 4 (Feedback Visual & Refinamento Adyen)
**Última atualização:** 2026-04-09

---

## Fases Concluídas ✅

### Reconhecimento e Arquitetura (Fase 0) ✅
- [x] Mapeamento de iframes (Adyen) e seletores
- [x] Definição de data schemas e limites de preenchimento automatizado (no iframes)

### Esqueleto + Storage + Injeção Inicial (Fase 1) ✅
- [x] Estrutura da extensão (Manifest, popup, icons)
- [x] CRUD completo de Usuários e Cartões (`options.js`)
- [x] Storage Wrapper API
- [x] Toolbar injetável de Participantes e Cartões (`ui-injector.js`)
- [x] Logica central de detecção de páginas (`content-script.js`)

### Endereço de Cobrança e Polimento de Options (Fase 2) ✅
- [x] Implementar estratégia de "Zona de Exclusão" (Não pular/preencher no Endereço de Cobrança por segurança e edge-cases da Adyen)
- [x] Melhorias da interface: Formulários sanfonados no CRUD (`+ Incluir` / `Cancelar` hide toggles)

### Etapas Intermediárias Automáticas (Fase 3) ✅
- [x] Seguro (RECUSAR automaticamente)
- [x] Entrega (SELECIONAR opção padrão/gratuita)
- [x] Termos (MARCAR checkboxes obrigatórios)
- [x] Confirmação Automática (Toggle configurável no Options - ON/OFF)
- [x] Preenchimento de Cartões: Observer para selecionar opção 1x no dropdown de Parcela do getCrowder.

---

## Fase 4 — Toast / Feedback Visual e Adyen Edge Cases (Atual)

- [ ] Melhorar Feedback das limitações do iframe (ex: Toast ou badge indicando "Insira CVV manualmente")
- [ ] Listener no botão de "Pagar": só clicar depois de validar se iframe já aceitou digitações manuais?
- [ ] Adicionar notificações toast customizadas injetadas para feedback ("8 campos preenchidos", "Salvando...")

---

## Fases Futuras (Opcionais)

- **Fase 5** — Botão Flutuante global / Action Menu unificado
- **Fase 6** — Atalhos de Teclado (`Alt+1`) para preencher slots rápidos
- **Fase 7** — Testes E2E complexos e Deploy local
