/**
 * Schema factories para User e Card
 */

function createUser(data = {}) {
  return {
    id: crypto.randomUUID(),
    label: data.label || '',
    personal: {
      fullName: data.personal?.fullName || '',
      cpf: data.personal?.cpf || '',
      birthDate: data.personal?.birthDate || '',
      email: data.personal?.email || '',
      phone: data.personal?.phone || ''
    },
    halfTicket: {
      type: data.halfTicket?.type || '', // Student|DisabledPerson|LowIncomeYouth|Teachers|OldMan|Retirees
      cieNumber: data.halfTicket?.cieNumber || '',
      expiration: data.halfTicket?.expiration || '',
      course: data.halfTicket?.course || '',
      institution: data.halfTicket?.institution || '',
      city: data.halfTicket?.city || '',
      state: data.halfTicket?.state || ''
    }
  };
}

function createCard(data = {}) {
  return {
    id: crypto.randomUUID(),
    label: data.label || '',
    number: data.number || '',
    holderName: data.holderName || '',
    expiration: data.expiration || '',
    cvv: data.cvv || ''
  };
}

function createInitialStorage() {
  return {
    users: [],
    cards: [],
    settings: {
      enabled: true
    }
  };
}
