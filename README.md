# Ticketmaster Brasil Autocomplete 🎟️⚡

Uma extensão de navegador para Google Chrome que preenche de forma automática e ultrarrápida os formulários de checkout de ingressos da Ticketmaster Brasil. Evite o desgaste de digitar manualmente dados cadastrais, informações de cartões e tipos de meia-entrada na pressa de garantir seu ingresso em disputadas vendas gerais.

---

## 🚀 Funcionalidades

- **Preenchimento Instantâneo de Participantes**: Nome, CPF, e-mail, telefone e data de nascimento em um clique.
- **Suporte Inteligente à Meia-Entrada**: Insere de forma automática a sua categoria e dados auxiliares (ex: Número da CIE Universitária, Instituição de Ensino, etc).
- **Gestão Integrada de Endereços de Cobrança**: Máquina de estado (State Machine) inteligente que lida com a API de CEP dos Correios (GetCrowder) do próprio Ticketmaster, garantindo precisão ao injetar automagicamente ruas e complementos sem ferir as chamadas nativas de validação do site.
- **Injeção de Cartões de Crédito**: Acelere inserindo os dados iniciais dos formulários de pagamento (Titular) com 1 botão para focar só na Numeração Segura em segundos.
- **Piloto Automático de Checkouts**: Habilidade nativa de marcar agilmente os Termos de Uso, recusar Seguros desnecessários de Imprevistos e priorizar taxa zero de entrega por conta própria.

## 🔥 Como Instalar

Como se trata de uma extensão focada em performance pessoal (e não publicada abertamente na Web Store), a instalação é rápida pelo Modo Desenvolvedor:

1. Acesse a aba de **Releases** na lateral direita da página principal do repositório no Github (ou clique no link mais recente atrelado a este repositório).
2. Baixe o arquivo `.zip` correspondente sob as opções de *Assets* no final da postagem de Release e extraia a pasta num local acessado facilmente por você no computador.
3. Abra seu Google Chrome (ou teclados Chromium como Brave/Edge) e na barra de endereço digite: `chrome://extensions/`
4. Habilite a chave de **"Modo do desenvolvedor"** no canto superior direito da tela.
5. Clique no botão **"Carregar sem compactação"** (Load unpacked) na barra superior esquerda.
6. Selecione a pasta extraída (certifique-se de que é a pasta que contém o arquivo `manifest.json` original).
7. Pronto! A extensão estará ativa. Agora basta fixar o ícone dela para facilitar, clicar com o botão direito `> Opções` e pré-cadastrar seus dados.

## 🛠️ Como Utilizar

- **Configurações Prévias:** Após instalada, acesse as "Opções" da extensão. É lá que você cadastra todos os participantes e cartões. É possível exportar os dados via arquivo JSON e restaurá-los!
- **Na Hora da Compra:** Ao alcançar a etapa de informar os "Detalhes dos participantes", uma aba azul do Autocomplete surgirá integrada ao site. Clique no botão com o nome do perfil desejado e os campos serão ativados.
- **No Endereço de Cobrança:** Ao cair na tela de moradias, selecione seu Endereço no novo menu que injetamos — aguarde cerca de 1,5s enquanto o bot dispara o CEP pro site nativo confirmar a existência da Rua antes dele re-injetar os números e preencher sua cidade e estado para o botão "Continuar" acender na mesma hora.
- **Na Tela do Cartão:** A barra vai reaparecer sobre o formulário de pagamento em si. Ao selecionar seu Cartão, a mecânica garantirá a inserção dos dados simples antes de delegar a você a numeração de segurança, contornando travas rigorosas dos gateways globais da marca *Adyen*.

## 🔐 Privacidade e Segurança

A extensão é baseada em "Zero Dependências" (Vanilla JS puro). Ela **não** faz chamadas externas, rastreamentos ou requisições escondidas. Nós entendemos o risco de colocar seus dados de pagamento em plugins, então tudo preenchido e salvo nas Opções fica estritamente na memória Criptografada em disco do **seu próprio navegador** (`chrome.storage.local`). O repasse de CVV é impedido ativamente pelas iframes da própria operadora bancária para preservar o portador.

## 🤝 Repositório

Problemas com seletores mudando misteriosamente de nome de um dia para o outro? O Ticketmaster alterou a estrutura do checkout? Sinta-se livre para abrir uma **Issue** relatando o desvio, ou fazer um Fork e mandar um bom **Pull Request** corrigindo os templates de seletores.
