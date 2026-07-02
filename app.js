const sharedEndpoint = https://script.google.com/macros/s/AKfycby3zChxkjGviltSYd9cRhOaFgeqJP4YpOcKRS1WOzj-9BVSJIZFqkqDGzUSiUiwHaZf/exec;

const categories = [
  'Alle',
  'Have og gård',
  'Indkøb',
  'Reparationer',
  'Dyr',
  'Børn',
  'Andet'
];

const starterTasks = [
  {
    id: crypto.randomUUID(),
    title: 'Hjælp til at luge forhave',
    category: 'Have og gård',
    area: 'Ved Tordenskjoldsgade',
    budget: '300 kr.',
    time: 'Lørdag formiddag',
    description: 'Et lille bed skal luges og have kørt haveaffald væk. Jeg har handsker og redskaber.',
    owner: 'Inge',
    ownerNote: 'Oprettet af nabo',
    contact: 'Telefon deles efter aftale',
    createdAt: new Date().toISOString(),
    bids: [
      { name: 'Mads', offer: '250 kr.', message: 'Jeg kan komme lørdag kl. 10.' }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Indkøb og aflevering',
    category: 'Indkøb',
    area: 'Niels Juels Gade',
    budget: '100 kr.',
    time: 'I dag efter kl. 16',
    description: 'Jeg mangler hjælp til at hente lidt varer og aflevere dem ved døren.',
    owner: 'Sara',
    ownerNote: 'Oprettet af nabo',
    contact: 'Aftales i appen',
    createdAt: new Date().toISOString(),
    bids: []
  },
  {
    id: crypto.randomUUID(),
    title: 'Luftning af rolig hund',
    category: 'Dyr',
    area: 'Trøjborgvej',
    budget: '150 kr.',
    time: 'Tirsdag aften',
    description: 'Rolig ældre hund skal luftes i cirka 30 minutter. Snor og poser ligger klar.',
    owner: 'Jonas',
    ownerNote: 'Oprettet af nabo',
    contact: 'Telefon deles efter accept',
    createdAt: new Date().toISOString(),
    bids: [
      { name: 'Amina', offer: 'Kan hjælpe', message: 'Jeg bor tæt på og kan tage turen.' }
    ]
  }
];

const state = {
  user: read('trojborg-user', null),
  tasks: read('trojborg-tasks', starterTasks),
  activeCategory: 'Alle',
  activeBidTask: null
};

const elements = {
  accountArea: document.querySelector('#accountArea'),
  categoryFilters: document.querySelector('#categoryFilters'),
  searchInput: document.querySelector('#searchInput'),
  openTaskButton: document.querySelector('#openTaskButton'),
  taskList: document.querySelector('#taskList'),
  resultText: document.querySelector('#resultText'),
  openCount: document.querySelector('#openCount'),
  bidCount: document.querySelector('#bidCount'),
  authDialog: document.querySelector('#authDialog'),
  authForm: document.querySelector('#authForm'),
  taskDialog: document.querySelector('#taskDialog'),
  taskForm: document.querySelector('#taskForm'),
  taskCategory: document.querySelector('#taskCategory'),
  bidDialog: document.querySelector('#bidDialog'),
  bidForm: document.querySelector('#bidForm'),
  bidTaskTitle: document.querySelector('#bidTaskTitle'),
  heroTaskButton: document.querySelector('#heroTaskButton')
};

function read(key, fallback) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureUser() {
  if (state.user) {
    return true;
  }

  elements.authDialog.showModal();
  return false;
}

function renderAccount() {
  if (!state.user) {
    elements.accountArea.innerHTML = '<button class="secondary" type="button" id="loginButton">Log ind / opret</button>';
    document.querySelector('#loginButton').addEventListener('click', () => elements.authDialog.showModal());
    return;
  }

  elements.accountArea.innerHTML = `
    <div class="profile-chip">
      <span class="avatar">${state.user.name.slice(0, 1).toUpperCase()}</span>
      <span>${escapeHtml(state.user.name)}</span>
    </div>
    <button class="secondary" type="button" id="logoutButton">Skift profil</button>
  `;
  document.querySelector('#logoutButton').addEventListener('click', () => elements.authDialog.showModal());
}

function renderFilters() {
  elements.categoryFilters.innerHTML = categories.map(category => `
    <button class="filter-button ${category === state.activeCategory ? 'active' : ''}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join('');

  elements.categoryFilters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      render();
    });
  });

  elements.taskCategory.innerHTML = categories
    .filter(category => category !== 'Alle')
    .map(category => `<option value="${category}">${category}</option>`)
    .join('');
}

function filteredTasks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  return state.tasks.filter(task => {
    const matchesCategory = state.activeCategory === 'Alle' || task.category === state.activeCategory;
    const haystack = [task.title, task.category, task.area, task.budget, task.time, task.description, task.owner]
      .join(' ')
      .toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function renderTasks() {
  const tasks = filteredTasks();
  elements.resultText.textContent = `${tasks.length} vist`;
  elements.openCount.textContent = state.tasks.length;
  elements.bidCount.textContent = state.tasks.reduce((total, task) => total + task.bids.length, 0);

  if (!tasks.length) {
    elements.taskList.innerHTML = '<div class="empty-state">Ingen opgaver matcher søgningen lige nu.</div>';
    return;
  }

  elements.taskList.innerHTML = tasks.map(task => `
    <article class="task-card">
      <div class="task-main">
        <div class="task-top">
          <div>
            <h3>${escapeHtml(task.title)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(task.area)}</span>
              <span>${escapeHtml(task.time)}</span>
              <span>${task.bids.length} bud</span>
            </div>
          </div>
          <span class="badge">${escapeHtml(task.category)}</span>
        </div>
        <p>${escapeHtml(task.description)}</p>
        <div class="owner-line">
          <span class="avatar">${escapeHtml(task.owner.slice(0, 1).toUpperCase())}</span>
          <span>${escapeHtml(task.owner)} - ${escapeHtml(task.ownerNote || 'Lokal bruger')}</span>
        </div>
      </div>
      <aside class="task-side">
        <div class="price-box">
          <span>Budget</span>
          <strong>${escapeHtml(task.budget)}</strong>
          <span>${escapeHtml(task.contact || 'Kontakt aftales efter accept')}</span>
        </div>
        <div>
          <strong>Seneste bud</strong>
          <ul class="bid-list">
            ${task.bids.length ? task.bids.slice(-2).map(bid => `
              <li><strong>${escapeHtml(bid.name)}</strong>: ${escapeHtml(bid.offer)}<br>${escapeHtml(bid.message)}</li>
            `).join('') : '<li>Ingen bud endnu.</li>'}
          </ul>
        </div>
        <div class="card-actions">
          <button class="primary bid-button" type="button" data-task-id="${task.id}">Byd ind</button>
          <button class="danger delete-task-button" type="button" data-task-id="${task.id}">Slet</button>
        </div>
      </aside>
    </article>
  `).join('');

  elements.taskList.querySelectorAll('.bid-button').forEach(button => {
    button.addEventListener('click', () => {
      if (!ensureUser()) {
        return;
      }

      state.activeBidTask = state.tasks.find(task => task.id === button.dataset.taskId);
      elements.bidTaskTitle.textContent = state.activeBidTask.title;
      elements.bidDialog.showModal();
    });
  });

  elements.taskList.querySelectorAll('.delete-task-button').forEach(button => {
    button.addEventListener('click', () => {
      const task = state.tasks.find(item => item.id === button.dataset.taskId);
      if (!task || !confirm(`Slet opgaven "${task.title}"?`)) {
        return;
      }

      state.tasks = state.tasks.filter(item => item.id !== task.id);
      write('trojborg-tasks', state.tasks);
      render();
    });
  });
}

async function sendTaskToSharedList(task) {
  if (!sharedEndpoint) return;
  await fetch(sharedEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      type: 'task',
      createdAt: task.createdAt,
      title: task.title,
      category: task.category,
      area: task.area,
      budget: task.budget,
      time: task.time,
      description: task.description,
      owner: task.owner,
      ownerEmail: state.user?.email || '',
      ownerPhone: state.user?.phone || '',
      contact: task.contact
    })
  });
}

function render() {
  renderAccount();
  renderFilters();
  renderTasks();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

elements.searchInput.addEventListener('input', renderTasks);

elements.openTaskButton.addEventListener('click', () => {
  if (ensureUser()) {
    elements.taskDialog.showModal();
  }
});

elements.heroTaskButton.addEventListener('click', () => {
  if (ensureUser()) {
    elements.taskDialog.showModal();
  }
});

document.querySelectorAll('.close-dialog').forEach(button => {
  button.addEventListener('click', event => {
    event.target.closest('dialog').close();
  });
});

document.querySelectorAll('[data-copy-email]').forEach(button => {
  button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = 'Kopieret';
    } catch {
      button.textContent = email;
    }
    setTimeout(() => {
      button.textContent = 'Kopier mailadresse';
    }, 2500);
  });
});

elements.authForm.addEventListener('submit', event => {
  event.preventDefault();
  state.user = {
    name: document.querySelector('#nameInput').value.trim(),
    email: document.querySelector('#emailInput').value.trim(),
    phone: document.querySelector('#phoneInput').value.trim()
  };
  write('trojborg-user', state.user);
  elements.authDialog.close();
  renderAccount();
});

elements.taskForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!ensureUser()) {
    return;
  }

  const task = {
    id: crypto.randomUUID(),
    title: document.querySelector('#taskTitle').value.trim(),
    category: document.querySelector('#taskCategory').value,
    area: document.querySelector('#taskArea').value.trim(),
    budget: document.querySelector('#taskBudget').value.trim(),
    time: document.querySelector('#taskTime').value.trim(),
    description: document.querySelector('#taskDescription').value.trim(),
    owner: state.user.name,
    ownerNote: 'Ny lokal opgave',
    contact: document.querySelector('#taskContact').value.trim() || 'Kontakt aftales efter accept',
    createdAt: new Date().toISOString(),
    bids: []
  };

  state.tasks.unshift(task);
  write('trojborg-tasks', state.tasks);
  elements.taskForm.reset();
  elements.taskDialog.close();
  render();

  try {
    await sendTaskToSharedList(task);
  } catch (error) {
    console.warn('Opgaven blev gemt lokalt, men kunne ikke sendes til den fælles liste.', error);
  }
});

elements.bidForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!state.activeBidTask || !ensureUser()) {
    return;
  }

  state.activeBidTask.bids.push({
    name: state.user.name,
    offer: document.querySelector('#bidOffer').value.trim(),
    message: document.querySelector('#bidMessage').value.trim()
  });

  write('trojborg-tasks', state.tasks);
  elements.bidForm.reset();
  elements.bidDialog.close();
  renderTasks();
});

render();
