# Ticketmaster Brasil Autocomplete 🎟️⚡

Uma extensão de navegador para Google Chrome que preenche de forma automática e ultrarrápida os formulários de checkout de ingressos da Ticketmaster Brasil. Evite o desgaste de digitar manualmente dados cadastrais, informações de cartões e tipos de meia-entrada na pressa de garantir seu ingresso em disputadas vendas gerais.

---

## 🚀 Funcionalidades

- **Preenchimento Instantâneo de Participantes**: Nome, CPF, e-mail, telefone e data de nascimento em um clique.
- **Suporte Inteligente à Meia-Entrada**: Insere de forma automática a sua categoria e dados auxiliares (ex: Número da CIE Universitária, Instituição de Ensino, etc).
- **Gestão Integrada de Cartões de Crédito**: Selecione múltiplos cartões pré-cadastrados, permitindo que a extensão agilize a seleção de parcelamento e insira os dados iniciais dos pesados formulários de pagamento.
- **Auto-Avanço**: Habilidade de marcar rapidamente os Termos de Uso, recusar Seguros extras e auto-selecionar o envio padrão sem gastar tempo.
- **Painel Inline**: Uma barra invisível salta automaticamente na própria tela do checkout (sem popups) para você selecionar exatamente qual perfil deseja injetar.

## 🔥 Como Instalar

Como se trata de uma extensão focada em performance pessoal (e não publicada abertamente na Web Store), a instalação é rápida pelo Modo Desenvolvedor:

1. Baixe os arquivos do projeto abrindo a página principal deste repositório e clicando no botão verde **Code > Download ZIP**.
2. Extraia o arquivo `.zip` baixado em uma pasta acessível do seu computador.
3. Abra seu Google Chrome (ou teclados Chromium como Brave/Edge) e na barra de endereço digite: `chrome://extensions/`
4. Habilite a chave de **"Modo do desenvolvedor"** no canto superior direito da tela.
5. Clique no botão **"Carregar sem compactação"** (Load unpacked) na barra superior esquerda.
6. Selecione a pasta extraída (certifique-se de que é a pasta que contém o arquivo `manifest.json` original).
7. Pronto! A extensão estará ativa. Agora basta fixar o ícone dela para facilitar, clicar com o botão direito `> Opções` e pré-cadastrar seus dados.

## 🛠️ Como Utilizar

- **Configurações Prévias:** Após instalada, acesse as "Opções" da extensão. É lá que você cadastra todos os participantes e cartões. É possível exportar os dados via arquivo JSON e restaurá-los!
- **Na Hora da Compra:** Ao alcançar a etapa de informar os "Detalhes dos participantes", uma aba azul do Autocomplete surgirá integrada ao site. Clique no botão com o nome do perfil desejado e os campos serão ativados.
- **Na Tela do Cartão:** A barra vai reaparecer sobre o formulário de pagamento. Ao selecionar seu cartão, o Titular e o tempo do input serão adiantadas - o que é crítico devido ao bloqueio e à criptografia forçada da plataforma da Adyen Ticketmaster. **Nota:** *Por segurança arquitetural da Adyen, pode ser necessário preencher manulamente o Número do Cartão e CVV.*

## 🔐 Privacidade e Segurança

A extensão é baseada em "Zero Dependências" (Vanilla JS puro). Ela **não** faz chamadas externas, rastreamentos ou requisições escondidas. Nós entendemos o risco de colocar seus dados de pagamento em plugins, então tudo preenchido e salvo nas Opções fica estritamente na memória Criptografada em disco do **seu próprio navegador** (`chrome.storage.local`). O repasse de CVV é impedido ativamente pelas iframes da própria operadora bancária para preservar o portador.

## 🤝 Repositório

Problemas com seletores mudando misteriosamente de nome de um dia para o outro? O Ticketmaster alterou a estrutura do checkout? Sinta-se livre para abrir uma **Issue** relatando o desvio, ou fazer um Fork e mandar um bom **Pull Request** corrigindo os templates de seletores.
