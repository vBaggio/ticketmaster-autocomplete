/**
 * Options page — CRUD de usuários e cartões (Etapa B)
 */

let editingUserId = null;
let editingCardId = null;

// Data de nascimento está sempre nos dados pessoais comuns (userBirthDate).
// Os campos extras por tipo são apenas os específicos daquele tipo.
const HALF_TICKET_TYPES = {
  Student: {
    label: 'Estudante (CIE)',
    fields: ['cieNumber', 'cieExpiration', 'institution', 'city', 'state', 'course']
  },
  DisabledPerson: {
    label: 'Pessoa com Deficiência',
    fields: [] // campos extras a confirmar quando HTML for capturado
  },
  LowIncomeYouth: {
    label: 'Jovem de Baixa Renda',
    fields: []
  },
  Teachers: {
    label: 'Professor/Educador',
    fields: []
  },
  OldMan: {
    label: 'Maior de 60 anos',
    fields: []
  },
  Retirees: {
    label: 'Aposentado',
    fields: []
  }
};

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== USUÁRIOS =====

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userData = {
    label: document.getElementById('userLabel').value,
    personal: {
      fullName: document.getElementById('userFullName').value,
      cpf: document.getElementById('userCPF').value,
      birthDate: document.getElementById('userBirthDate').value,
      email: document.getElementById('userEmail').value,
      phone: document.getElementById('userPhone').value
    },
    halfTicket: {
      type: document.getElementById('userHalfTicketType').value,
      cieNumber: document.getElementById('userCIENumber')?.value || '',
      expiration: document.getElementById('userCIEExpiration')?.value || '',
      course: document.getElementById('userCourse')?.value || '',
      institution: document.getElementById('userInstitution')?.value || '',
      city: document.getElementById('userCity')?.value || '',
      state: document.getElementById('userState')?.value || ''
    }
  };

  if (editingUserId) {
    await updateUser(editingUserId, userData);
    editingUserId = null;
    document.getElementById('userFormTitle').textContent = 'Novo Usuário';
    document.getElementById('userSubmitBtn').textContent = 'Adicionar Usuário';
    document.getElementById('userCancelBtn').style.display = 'none';
  } else {
    const user = createUser(userData);
    await addUser(user);
  }

  document.getElementById('userForm').reset();
  document.getElementById('userHalfTicketType').value = '';
  updateHalfTicketExtras();
  loadUsers();
});

document.getElementById('userCancelBtn').addEventListener('click', () => {
  editingUserId = null;
  document.getElementById('userForm').reset();
  document.getElementById('userFormTitle').textContent = 'Novo Usuário';
  document.getElementById('userSubmitBtn').textContent = 'Adicionar Usuário';
  document.getElementById('userCancelBtn').style.display = 'none';
  document.getElementById('userHalfTicketType').value = '';
  updateHalfTicketExtras();
});

document.getElementById('userHalfTicketType').addEventListener('change', updateHalfTicketExtras);

function updateHalfTicketExtras() {
  const type = document.getElementById('userHalfTicketType').value;
  const container = document.getElementById('halfTicketExtras');
  container.innerHTML = '';

  if (!type || !HALF_TICKET_TYPES[type]) return;

  const fields = HALF_TICKET_TYPES[type].fields;
  const fieldLabels = {
    cieNumber: { label: 'Número da Carteirinha CIE', placeholder: '0000000000', id: 'userCIENumber' },
    cieExpiration: { label: 'Validade da CIE (MM/AAAA)', placeholder: '12/2025', id: 'userCIEExpiration' },
    institution: { label: 'Instituição', placeholder: 'USP', id: 'userInstitution' },
    city: { label: 'Cidade', placeholder: 'São Paulo', id: 'userCity' },
    state: { label: 'Estado (sigla)', placeholder: 'SP', id: 'userState' },
    course: { label: 'Curso', placeholder: 'Engenharia de Software', id: 'userCourse' }
  };

  fields.forEach(field => {
    if (fieldLabels[field]) {
      const info = fieldLabels[field];
      const div = document.createElement('div');
      div.className = 'form-group';
      div.innerHTML = `
        <label for="${info.id}">${info.label}</label>
        <input type="text" id="${info.id}" placeholder="${info.placeholder}">
      `;
      container.appendChild(div);
    }
  });
}

async function loadUsers() {
  try {
    const users = await getUsers();
    const list = document.getElementById('usersList');

    if (users.length === 0) {
      list.innerHTML = '<p class="empty-message">Nenhum usuário cadastrado</p>';
      return;
    }

    list.innerHTML = '<table class="data-table"><tbody>' +
      users.map(user => `
        <tr>
          <td>
            <strong>${escapeHTML(user.label)}</strong><br>
            <small>${escapeHTML(user.personal.fullName)}</small>
          </td>
          <td>
            <small>${escapeHTML(user.personal.cpf)}</small>
          </td>
          <td>
            <button class="btn btn-sm btn-edit" data-user-id="${escapeHTML(user.id)}">✏️ Editar</button>
            <button class="btn btn-sm btn-delete" data-user-id="${escapeHTML(user.id)}">🗑️ Remover</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';

    document.querySelectorAll('[data-user-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = btn.dataset.userId;
        if (btn.classList.contains('btn-edit')) {
          await editUser(userId);
        } else if (btn.classList.contains('btn-delete')) {
          if (confirm('Tem certeza que deseja remover este usuário?')) {
            await deleteUser(userId);
            loadUsers();
          }
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

async function editUser(userId) {
  const users = await getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  editingUserId = userId;
  document.getElementById('userLabel').value = user.label;
  document.getElementById('userFullName').value = user.personal.fullName;
  document.getElementById('userCPF').value = user.personal.cpf;
  document.getElementById('userBirthDate').value = user.personal.birthDate;
  document.getElementById('userEmail').value = user.personal.email;
  document.getElementById('userPhone').value = user.personal.phone;
  document.getElementById('userHalfTicketType').value = user.halfTicket.type;
  updateHalfTicketExtras();

  if (user.halfTicket.type) {
    const setField = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setField('userCIENumber', user.halfTicket.cieNumber);
    setField('userCIEExpiration', user.halfTicket.expiration);
    setField('userInstitution', user.halfTicket.institution);
    setField('userCity', user.halfTicket.city);
    setField('userState', user.halfTicket.state);
    setField('userCourse', user.halfTicket.course);
  }

  document.getElementById('userFormTitle').textContent = 'Editar Usuário';
  document.getElementById('userSubmitBtn').textContent = 'Atualizar Usuário';
  document.getElementById('userCancelBtn').style.display = 'inline-block';
  document.querySelector('#userForm').scrollIntoView({ behavior: 'smooth' });
}

// ===== CARTÕES =====

document.getElementById('cardForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cardData = {
    label: document.getElementById('cardLabel').value,
    number: document.getElementById('cardNumber').value,
    holderName: document.getElementById('cardHolder').value,
    expiration: document.getElementById('cardExpiration').value,
    cvv: document.getElementById('cardCVV').value
  };

  if (editingCardId) {
    await updateCard(editingCardId, cardData);
    editingCardId = null;
    document.getElementById('cardFormTitle').textContent = 'Novo Cartão';
    document.getElementById('cardSubmitBtn').textContent = 'Adicionar Cartão';
    document.getElementById('cardCancelBtn').style.display = 'none';
  } else {
    const card = createCard(cardData);
    await addCard(card);
  }

  document.getElementById('cardForm').reset();
  loadCards();
});

document.getElementById('cardCancelBtn').addEventListener('click', () => {
  editingCardId = null;
  document.getElementById('cardForm').reset();
  document.getElementById('cardFormTitle').textContent = 'Novo Cartão';
  document.getElementById('cardSubmitBtn').textContent = 'Adicionar Cartão';
  document.getElementById('cardCancelBtn').style.display = 'none';
});

async function loadCards() {
  try {
    const cards = await getCards();
    const list = document.getElementById('cardsList');

    if (cards.length === 0) {
      list.innerHTML = '<p class="empty-message">Nenhum cartão cadastrado</p>';
      return;
    }

    list.innerHTML = '<table class="data-table"><tbody>' +
      cards.map(card => `
        <tr>
          <td>
            <strong>${escapeHTML(card.label)}</strong><br>
            <small>${escapeHTML(card.holderName)}</small>
          </td>
          <td>
            <small>${escapeHTML(maskCardNumber(card.number))} • ${escapeHTML(card.expiration)}</small>
          </td>
          <td>
            <button class="btn btn-sm btn-edit" data-card-id="${escapeHTML(card.id)}">✏️ Editar</button>
            <button class="btn btn-sm btn-delete" data-card-id="${escapeHTML(card.id)}">🗑️ Remover</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';

    document.querySelectorAll('[data-card-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const cardId = btn.dataset.cardId;
        if (btn.classList.contains('btn-edit')) {
          await editCard(cardId);
        } else if (btn.classList.contains('btn-delete')) {
          if (confirm('Tem certeza que deseja remover este cartão?')) {
            await deleteCard(cardId);
            loadCards();
          }
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar cartões:', error);
  }
}

async function editCard(cardId) {
  const cards = await getCards();
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  editingCardId = cardId;
  document.getElementById('cardLabel').value = card.label;
  document.getElementById('cardNumber').value = card.number;
  document.getElementById('cardHolder').value = card.holderName;
  document.getElementById('cardExpiration').value = card.expiration;
  document.getElementById('cardCVV').value = card.cvv;

  document.getElementById('cardFormTitle').textContent = 'Editar Cartão';
  document.getElementById('cardSubmitBtn').textContent = 'Atualizar Cartão';
  document.getElementById('cardCancelBtn').style.display = 'inline-block';
  document.querySelector('#cardForm').scrollIntoView({ behavior: 'smooth' });
}

function maskCardNumber(number) {
  const last4 = number.slice(-4);
  return '**** **** **** ' + last4;
}

// ===== EXPORT/IMPORT =====

document.getElementById('exportBtn').addEventListener('click', async () => {
  try {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticketmaster-autocomplete-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar:', error);
    alert('Erro ao exportar dados');
  }
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const success = await importData(text);
    if (success) {
      alert('Dados importados com sucesso!');
      loadUsers();
      loadCards();
    } else {
      alert('Erro ao importar dados. Verifique o formato do arquivo.');
    }
  } catch (error) {
    console.error('Erro ao importar:', error);
    alert('Erro ao ler arquivo');
  }
});

// Carregar dados ao abrir
loadUsers();
loadCards();

console.log('[Ticketmaster Autocomplete] Options page carregada');
