/**
 * Popup — Interface do popup (Etapa C)
 */

document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

async function updateStatus() {
  try {
    const users = await getUsers();
    const cards = await getCards();
    const status = document.getElementById('status');
    status.textContent = `${users.length} usuários · ${cards.length} cartões`;
  } catch (error) {
    console.error('Erro ao carregar status:', error);
    document.getElementById('status').textContent = 'Erro ao carregar dados';
  }
}

updateStatus();
