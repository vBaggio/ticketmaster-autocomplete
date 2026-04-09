# Ticketmaster Autocomplete — Extensão Chrome

Extensão Chrome **pessoal** (não publicada) para preencher automaticamente os formulários de checkout do Ticketmaster Brasil.

## O que preenche

- Dados pessoais: nome completo, CPF, data de nascimento, e-mail, telefone
- Carteirinha de meia-entrada: número CIE, data de expiração, curso
- Cartão de crédito: número, titular, validade, CVV
- Endereço de cobrança: CEP, logradouro, número, complemento, bairro, cidade, estado

Suporta **múltiplos usuários** e **múltiplos cartões** independentes entre si. A seleção é feita por um botão flutuante injetado na própria página do checkout.

## Stack

- Vanilla JS + Manifest V3 (sem build step)
- `chrome.storage.local` para persistência
- Sem dependências externas

## Como instalar (modo desenvolvedor)

1. Abra `chrome://extensions`
2. Ative "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta raiz deste projeto

## Status atual

| Fase | Status | Descrição |
|------|--------|-----------|
| Fase 0 | 🔄 Em andamento | Reconhecimento das páginas do Ticketmaster |
| Fase 1 | ⏳ Pendente | Esqueleto funcional (manifest, estrutura, storage) |
| Fase 2 | ⏳ Pendente | Options page — CRUD de usuários e cartões |
| Fase 3 | ⏳ Pendente | Popup básico (toggle on/off) |
| Fase 4 | ⏳ Pendente | Content script + botão flutuante |
| Fase 5 | ⏳ Pendente | Mapeamento de campos (depende do HTML do checkout) |
| Fase 6 | ⏳ Pendente | Preenchimento real |
| Fase 7 | ⏳ Pendente | Polimento e atalhos |

## Arquivos de referência

- `ARCHITECTURE.md` — arquitetura técnica, schema, estrutura de pastas
- `CHECKOUT-ANALYSIS.md` — análise das páginas do Ticketmaster, seletores CSS, quirks do site
