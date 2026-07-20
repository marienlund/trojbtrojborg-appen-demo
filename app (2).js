const ADMIN_EMAIL = "jensenhp79@gmail.com";

const sharedEndpoint = "https://script.google.com/macros/s/AKfycbx5iKzA0IXFrKRV7U7PRANYE9s-THrfhKglL8UmssWqd011exyODOf28fO3emDqXcSJ/exec";

const SUPABASE_URL = "https://sgrwqwhisjbwjyduarat.supabase.co";
const SUPABASE_KEY = "sb_publishable_OTE2k2Ch4Rczfg8V29gfMA_8mxmgvQr";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = [
  'Alle',
  'Have og gård',
  'Indkøb',
  'Reparationer',
  'Dyr',
  'Børn',
  'Andet'
];

const state = {
  user: readLocal('trojborg-user', null),
  tasks: [],
  activeCategory: 'Alle',
  activeBidTask: null,
  loading: true,
  realtimeChannels: []
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
  heroTaskButton: document.querySelector('#heroTaskButton'),
  toastContainer: document.querySelector('#toastContainer')
};

// ─── localStorage helpers ───

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Lyd når pop-up vises ───

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, ctx.currentTime);       // C5
    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Lyd virker ikke – det er okay
  }
}

// ─── Dato-formatering ───

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const dag = String(d.getDate()).padStart(2, '0');
  const måned = String(d.getMonth() + 1).padStart(2, '0');
  const år = d.getFullYear();
  const timer = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dag}.${måned}.${år} kl. ${timer}:${min}`;
}

// ─── Toast-notifikationer ───

function showToast(type, title, body, actions = [], ttl = 30000) {
  if (!elements.toastContainer) return;

  // Afspil lyd
  playNotificationSound();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-header">
      <span class="toast-title">${escapeHtml(title)}</span>
      <button class="toast-close" type="button" aria-label="Luk">&times;</button>
    </div>
    <div class="toast-body">${escapeHtml(body)}</div>
    ${actions.length ? `<div class="toast-actions">${actions.map(a => `<button class="${a.primary ? 'primary' : ''}" data-action="${a.id}">${escapeHtml(a.label)}</button>`).join('')}</div>` : ''}
  `;

  elements.toastContainer.appendChild(toast);

  const close = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', close);

  if (actions.length) {
    toast.querySelectorAll('.toast-actions button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = actions.find(a => a.id === btn.dataset.action);
        if (action) action.handler();
        close();
      });
    });
  }

  if (ttl > 0) {
    setTimeout(close, ttl);
  }
}

// ─── Supabase data helpers ───

async function loadTasks() {
  const { data: tasks, error } = await sb
    .from('tasks')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fejl ved hentning af opgaver:', error);
    return [];
  }

  const taskIds = tasks.map(t => t.id);
  let bidsMap = {};

  if (taskIds.length > 0) {
    const { data: bids, error: bidsError } = await sb
      .from('bids')
      .select('*')
      .in('task_id', taskIds)
      .order('created_at', { ascending: true });

    if (!bidsError && bids) {
      bids.forEach(bid => {
        if (!bidsMap[bid.task_id]) bidsMap[bid.task_id] = [];
        bidsMap[bid.task_id].push({
          name: bid.bidder_name,
          offer: bid.offer,
          message: bid.message
        });
      });
    }
  }

  return tasks.map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    area: t.area,
    budget: t.budget,
    time: t.time,
    description: t.description,
    owner: t.owner_name,
    ownerEmail: t.owner_email,
    ownerNote: 'Lokal bruger',
    contact: t.contact,
    createdAt: t.created_at,
    awardedTo: t.awarded_to || null,
    bids: bidsMap[t.id] || []
  }));
}

async function saveTask(task) {
  const { data, error } = await sb
    .from('tasks')
    .insert({
      title: task.title,
      category: task.category,
      area: task.area,
      budget: task.budget,
      time: task.time,
      description: task.description,
      owner_name: task.owner,
      owner_email: state.user?.email || '',
      owner_phone: state.user?.phone || '',
      contact: task.contact
    })
    .select()
    .single();

  if (error) {
    console.error('Fejl ved oprettelse af opgave:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    area: data.area,
    budget: data.budget,
    time: data.time,
    description: data.description,
    owner: data.owner_name,
    ownerEmail: data.owner_email,
    ownerNote: 'Ny lokal opgave',
    contact: data.contact,
    createdAt: data.created_at,
    awardedTo: null,
    bids: []
  };
}

async function saveBid(taskId, bid) {
  const { error } = await sb
    .from('bids')
    .insert({
      task_id: taskId,
      bidder_name: bid.name,
      offer: bid.offer,
      message: bid.message
    });

  if (error) {
    console.error('Fejl ved oprettelse af bud:', error);
    return false;
  }
  return true;
}

async function softDeleteTask(taskId) {
  const userEmail = state.user?.email || '';
  const { data, error } = await sb.rpc('soft_delete_task', {
    p_task_id: taskId,
    p_user_email: userEmail
  });

  if (error) {
    console.error('Fejl ved sletning:', error);
    return false;
  }
  return data === true;
}

async function awardTask(taskId, bidderName) {
  if (!state.user) return false;

  const { data, error } = await sb
    .from('tasks')
    .update({ awarded_to: bidderName })
    .eq('id', taskId);

  if (error) {
    console.error('Fejl ved tildeling af opgave:', error);
    alert('Kunne ikke tildele opgaven. Prøv igen.');
    return false;
  }

  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.awardedTo = bidderName;
  }

  renderTasks();
  return true;
}

// ─── Realtime ───

function setupRealtimeSubscriptions() {
  state.realtimeChannels.forEach(ch => sb.removeChannel(ch));
  state.realtimeChannels = [];

  const bidChannel = sb
    .channel('bids-realtime')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bids' },
      (payload) => handleNewBid(payload.new)
    )
    .subscribe();

  state.realtimeChannels.push(bidChannel);

  const taskChannel = sb
    .channel('tasks-realtime')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => handleTaskUpdate(payload.new)
    )
    .subscribe();

  state.realtimeChannels.push(taskChannel);
}

function handleNewBid(newBid) {
  const task = state.tasks.find(t => t.id === newBid.task_id);
  if (!task) return;

  const alreadyExists = task.bids.some(b => b.name === newBid.bidder_name && b.offer === newBid.offer);
  if (!alreadyExists) {
    task.bids.push({
      name: newBid.bidder_name,
      offer: newBid.offer,
      message: newBid.message
    });
    renderTasks();
  }

  if (state.user && state.user.email === task.ownerEmail) {
    const taskTitle = task.title.length > 40 ? task.title.slice(0, 40) + '…' : task.title;
    showToast(
      'info',
      '💡 Nyt bud på din opgave!',
      `${newBid.bidder_name} bød "${newBid.offer}" på "${taskTitle}"`,
      [
        { id: 'view', label: 'Se opgave', primary: true, handler: () => scrollToTask(task.id) },
        { id: 'dismiss', label: 'Luk', handler: () => {} }
      ],
      30000
    );
  }
}

function handleTaskUpdate(updatedTask) {
  const task = state.tasks.find(t => t.id === updatedTask.id);
  if (!task) return;

  const wasAwarded = task.awardedTo;
  const nowAwarded = updatedTask.awarded_to;
  task.awardedTo = nowAwarded || null;

  renderTasks();

  if (nowAwarded && nowAwarded !== wasAwarded) {
    if (state.user && state.user.name === nowAwarded) {
      showToast(
        'success',
        '🎉 Tillykke! Du har fået opgaven!',
        `"${task.title}" — kontakt opgave-ejer for at aftale detaljerne.`,
        [
          { id: 'view', label: 'Se opgave', primary: true, handler: () => scrollToTask(task.id) },
          { id: 'dismiss', label: 'Luk', handler: () => {} }
        ],
        30000
      );
    }
  }
}

function scrollToTask(taskId) {
  const cards = document.querySelectorAll('.task-card');
  for (const card of cards) {
    const btn = card.querySelector('[data-task-id]');
    if (btn && btn.dataset.taskId === taskId) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 0 3px var(--green), 0 8px 24px rgba(30,49,58,.12)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 3000);
      break;
    }
  }
}

// ─── UI helpers ───

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

function canDelete(task) {
  if (!state.user) return false;
  return state.user.email === task.ownerEmail || state.user.email === ADMIN_EMAIL;
}

function canAward(task) {
  if (!state.user) return false;
  if (task.awardedTo) return false;
  return state.user.email === task.ownerEmail || state.user.email === ADMIN_EMAIL;
}

function renderTasks() {
  const tasks = filteredTasks();
  elements.resultText.textContent = `${tasks.length} vist`;
  elements.openCount.textContent = state.tasks.length;
  elements.bidCount.textContent = state.tasks.reduce((total, task) => total + task.bids.length, 0);

  if (state.loading) {
    elements.taskList.innerHTML = '<div class="empty-state">Henter opgaver...</div>';
    return;
  }

  if (!tasks.length) {
    elements.taskList.innerHTML = '<div class="empty-state">Ingen opgaver matcher søgningen lige nu.</div>';
    return;
  }

  elements.taskList.innerHTML = tasks.map(task => {
    const isAwarded = task.awardedTo;
    const isOwner = state.user && state.user.email === task.ownerEmail;

    return `
    <article class="task-card ${isAwarded ? 'awarded' : ''}">
      <div class="task-main">
        <div class="task-top">
          <div>
            <h3>${escapeHtml(task.title)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(task.area)}</span>
              <span>${escapeHtml(task.time)}</span>
              <span>${task.bids.length} bud</span>
              ${isAwarded ? `<span class="awarded-badge">Tildelt ${escapeHtml(isAwarded)}</span>` : ''}
            </div>
            <div class="task-date">Oprettet ${formatDate(task.createdAt)}</div>
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
          <strong>Bud</strong>
          <ul class="bid-list">
            ${task.bids.length ? task.bids.map(bid => {
              const isBidder = state.user && state.user.name === bid.name;
              const isAccepted = isAwarded === bid.name;
              return `
                <li style="${isAccepted ? 'background:#eaf5ef;border:1px solid var(--green);' : ''}">
                  <strong>${escapeHtml(bid.name)}</strong>: ${escapeHtml(bid.offer)}<br>
                  ${escapeHtml(bid.message)}
                  ${isAccepted ? '<br><span style="color:var(--green);font-weight:700;font-size:12px;">✓ VALGT</span>' : ''}
                  ${!isAccepted && canAward(task) ? `<br><button class="accept-btn" data-task-id="${task.id}" data-bidder="${escapeHtml(bid.name)}">Godkend bud</button>` : ''}
                </li>
              `;
            }).join('') : '<li>Ingen bud endnu.</li>'}
          </ul>
        </div>
        <div class="card-actions">
          ${!isAwarded ? `<button class="primary bid-button" type="button" data-task-id="${task.id}">Byd ind</button>` : ''}
          ${canDelete(task) ? `<button class="danger delete-task-button" type="button" data-task-id="${task.id}">Slet</button>` : ''}
        </div>
      </aside>
    </article>`;
  }).join('');

  elements.taskList.querySelectorAll('.bid-button').forEach(button => {
    button.addEventListener('click', () => {
      if (!ensureUser()) return;
      state.activeBidTask = state.tasks.find(task => task.id === button.dataset.taskId);
      elements.bidTaskTitle.textContent = state.activeBidTask.title;
      elements.bidDialog.showModal();
    });
  });

  elements.taskList.querySelectorAll('.delete-task-button').forEach(button => {
    button.addEventListener('click', async () => {
      const task = state.tasks.find(item => item.id === button.dataset.taskId);
      if (!task || !confirm(`Slet opgaven "${task.title}"?`)) return;

      button.disabled = true;
      button.textContent = 'Sletter...';

      const success = await softDeleteTask(task.id);
      if (success) {
        state.tasks = state.tasks.filter(item => item.id !== task.id);
        render();
      } else {
        alert('Kunne ikke slette opgaven. Du har muligvis ikke rettigheder.');
        button.disabled = false;
        button.textContent = 'Slet';
      }
    });
  });

  elements.taskList.querySelectorAll('.accept-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const taskId = button.dataset.taskId;
      const bidderName = button.dataset.bidder;
      const task = state.tasks.find(t => t.id === taskId);

      if (!task || !confirm(`Tildel opgaven "${task.title}" til ${bidderName}?`)) return;

      button.disabled = true;
      button.textContent = 'Tildeler...';

      const success = await awardTask(taskId, bidderName);
      if (!success) {
        button.disabled = false;
        button.textContent = 'Godkend bud';
      }
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

// ─── Event listeners ───

elements.searchInput.addEventListener('input', renderTasks);

elements.openTaskButton.addEventListener('click', () => {
  if (ensureUser()) elements.taskDialog.showModal();
});

elements.heroTaskButton.addEventListener('click', () => {
  if (ensureUser()) elements.taskDialog.showModal();
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
    setTimeout(() => { button.textContent = 'Kopier mailadresse'; }, 2500);
  });
});

elements.authForm.addEventListener('submit', event => {
  event.preventDefault();
  state.user = {
    name: document.querySelector('#nameInput').value.trim(),
    email: document.querySelector('#emailInput').value.trim(),
    phone: document.querySelector('#phoneInput').value.trim()
  };
  writeLocal('trojborg-user', state.user);
  elements.authDialog.close();
  renderAccount();
});

elements.taskForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!ensureUser()) return;

  const submitButton = elements.taskForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Opretter...';

  const taskData = {
    title: document.querySelector('#taskTitle').value.trim(),
    category: document.querySelector('#taskCategory').value,
    area: document.querySelector('#taskArea').value.trim(),
    budget: document.querySelector('#taskBudget').value.trim(),
    time: document.querySelector('#taskTime').value.trim(),
    description: document.querySelector('#taskDescription').value.trim(),
    owner: state.user.name,
    contact: document.querySelector('#taskContact').value.trim() || 'Kontakt aftales efter accept'
  };

  const savedTask = await saveTask(taskData);

  if (savedTask) {
    state.tasks.unshift(savedTask);
    elements.taskForm.reset();
    elements.taskDialog.close();
    render();

    try {
      await sendTaskToSharedList(savedTask);
    } catch (error) {
      console.warn('Opgaven blev gemt i Supabase, men kunne ikke sendes til Google Sheets.', error);
    }
  } else {
    alert('Kunne ikke oprette opgaven. Prøv igen.');
  }

  submitButton.disabled = false;
  submitButton.textContent = 'Læg opgave op';
});

elements.bidForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!state.activeBidTask || !ensureUser()) return;

  const submitButton = elements.bidForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Sender...';

  const bid = {
    name: state.user.name,
    offer: document.querySelector('#bidOffer').value.trim(),
    message: document.querySelector('#bidMessage').value.trim()
  };

  const success = await saveBid(state.activeBidTask.id, bid);

  if (success) {
    state.activeBidTask.bids.push(bid);
    elements.bidForm.reset();
    elements.bidDialog.close();
    renderTasks();
  } else {
    alert('Kunne ikke sende bud. Prøv igen.');
  }

  submitButton.disabled = false;
  submitButton.textContent = 'Send bud';
});

// ─── Init ───

(async function init() {
  state.tasks = await loadTasks();
  state.loading = false;
  render();
  setupRealtimeSubscriptions();
})();
