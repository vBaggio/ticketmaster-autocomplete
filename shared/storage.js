/**
 * Wrapper tipado para chrome.storage.local
 */

// ===== USUÁRIOS =====

async function getUsers() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['users'], (result) => {
      resolve(result.users || []);
    });
  });
}

async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  return new Promise((resolve) => {
    chrome.storage.local.set({ users }, resolve);
  });
}

async function updateUser(id, updates) {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    return new Promise((resolve) => {
      chrome.storage.local.set({ users }, resolve);
    });
  }
}

async function deleteUser(id) {
  const users = await getUsers();
  const filtered = users.filter((u) => u.id !== id);
  return new Promise((resolve) => {
    chrome.storage.local.set({ users: filtered }, resolve);
  });
}

// ===== CARTÕES =====

async function getCards() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['cards'], (result) => {
      resolve(result.cards || []);
    });
  });
}

async function addCard(card) {
  const cards = await getCards();
  cards.push(card);
  return new Promise((resolve) => {
    chrome.storage.local.set({ cards }, resolve);
  });
}

async function updateCard(id, updates) {
  const cards = await getCards();
  const index = cards.findIndex((c) => c.id === id);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...updates };
    return new Promise((resolve) => {
      chrome.storage.local.set({ cards }, resolve);
    });
  }
}

async function deleteCard(id) {
  const cards = await getCards();
  const filtered = cards.filter((c) => c.id !== id);
  return new Promise((resolve) => {
    chrome.storage.local.set({ cards: filtered }, resolve);
  });
}

// ===== SETTINGS =====

async function getSetting(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      resolve(settings[key]);
    });
  });
}

async function setSetting(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      settings[key] = value;
      chrome.storage.local.set({ settings }, resolve);
    });
  });
}

// ===== EXPORT/IMPORT =====

async function exportData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (data) => {
      resolve(JSON.stringify(data, null, 2));
    });
  });
}

async function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
}
