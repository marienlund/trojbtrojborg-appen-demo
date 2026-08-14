const ADMIN_EMAIL = "jensenhp79@gmail.com";

const sharedEndpoint = window.TROJBORG_INTEREST_ENDPOINT || "https://script.google.com/macros/s/AKfycbz36C45zDnNnyYz6ZpzTj5oAtmlfOCHN3S2z9Fv78A2w4hxBtnbOs9EyPu4hLncmbBK/exec";

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
  realtimeChannels: [],
  lang: readLocal('trojborg-lang', 'da')
};

const categoryLabels = {
  da: {
    'Alle': 'Alle',
    'Have og gård': 'Have og gård',
    'Indkøb': 'Indkøb',
    'Reparationer': 'Reparationer',
    'Dyr': 'Dyr',
    'Børn': 'Børn',
    'Andet': 'Andet'
  },
  en: {
    'Alle': 'All',
    'Have og gård': 'Garden & Yard',
    'Indkøb': 'Groceries',
    'Reparationer': 'Repairs',
    'Dyr': 'Pets',
    'Børn': 'Kids',
    'Andet': 'Other'
  }
};

const i18n = {
  da: {
    tagline: 'Små lokale opgaver. Hurtige bud. Folk fra området.',
    quote: '“Trøjborg bliver et bedre sted, når vi hjælper hinanden. Del dine evner med en nabo – nogle gange mod betaling, men allerhelst med den varme og hjælpsomhed, der kendetegnede den gamle Trøjborg-ånd.”',
    eyebrow_market: 'Trøjborgs lokale opgavemarked',
    hero_h2: 'Få små opgaver klaret tæt på dig',
    hero_p: 'Opret en opgave med pris og tidspunkt. Lokale hjælpere kan byde ind, og du vælger selv hvem du vil gå videre med.',
    create_task: '+ Opret opgave',
    see_tasks: 'Se åbne opgaver',
    step1_t: '1. Beskriv opgaven',
    step1_d: 'Fortæl hvad, hvor og hvornår.',
    step2_t: '2. Modtag bud',
    step2_d: 'Lokale hjælpere byder ind.',
    step3_t: '3. Vælg hjælper',
    step3_d: 'Aftal detaljerne direkte.',
    search_placeholder: 'Søg efter opgave, område eller tekst',
    overview: 'Overblik',
    open_tasks_count: 'åbne opgaver',
    bids_count: 'bud afgivet',
    trust_title: 'Tryghed i lille skala',
    trust_1: 'Profil kræves før opgaver og bud',
    trust_2: 'Kun for private - firmaopslag hører ikke hjemme her',
    trust_3: 'Betaling aftales direkte mellem opretter og hjælper',
    trust_4: 'Kontakt deles først når man går videre',
    trust_5: 'Opgaver er lokale for Trøjborg',
    trust_6: 'Opgaver gemmes online og deles på tværs af brugere',
    open_tasks_title: 'Åbne opgaver nær Trøjborg',
    open_tasks_prefix: 'Åbne opgaver',
    no_tasks: 'Ingen opgaver matcher søgningen lige nu.',
    tasks_count_suffix: 'vist',
    tasks_in_category: 'opgave(r) i',
    interest_eyebrow: 'Interesseliste',
    interest_title: 'Få besked om relevante opgaver',
    interest_desc: 'Vælg de typer opgaver du gerne vil høre om...',
    interest_email_label: 'Email',
    interest_legend: 'Jeg vil gerne høre om',
    interest_submit: 'Gem interesse',
    contact_eyebrow: 'Kontakt',
    contact_title: 'Spørgsmål eller feedback?',
    contact_desc: 'Skriv til os, hvis du har idéer, spørgsmål eller vil hjælpe med at gøre Trøjborg-appen bedre.',
    send_mail_btn: '✉️ Skriv en mail',
    sponsor_title: 'Vil du nå lokale folk på Trøjborg?',
    sponsor_desc: 'Vi åbner for få relevante lokale sponsorer, der passer til området og appens formål.',
    sponsor_btn: '✉️ Skriv om sponsorplads',
    login_btn: 'Log ind / opret',
    logout_btn: 'Skift profil',
    budget_label: 'Budget',
    bids_label: 'bud',
    latest_bids: 'Seneste bud',
    no_bids: 'Ingen bud endnu.',
    bid_btn: 'Byd ind',
    delete_btn: 'Slet',
    guide_btn: '📖 Vejledning',
    guide_title: '📖 Vejledning til Trøjborg-appen',
    guide_subtitle: 'Få samlet overblik over hvordan du bruger Trøjborg-appen og opretter opgaver.',
    tab_webapp: '📱 Webapp på telefon',
    tab_task: '📝 Opret opgave',
    open_full_img: '🔍 Åbn billedet i fuld størrelse'
  },
  en: {
    tagline: 'Small local tasks. Quick offers. Local neighbors.',
    quote: '“Trøjborg becomes a better place when we help each other. Share your skills with a neighbor – sometimes for payment, but best of all with the warmth and helpfulness of the community spirit.”',
    eyebrow_market: 'Trøjborg local task marketplace',
    hero_h2: 'Get small tasks done near you',
    hero_p: 'Post a task with price and time. Local helpers place offers, and you choose who to move forward with.',
    create_task: '+ Post task',
    see_tasks: 'View open tasks',
    step1_t: '1. Describe task',
    step1_d: 'Tell what, where and when.',
    step2_t: '2. Receive offers',
    step2_d: 'Local helpers place offers.',
    step3_t: '3. Choose helper',
    step3_d: 'Agree on details directly.',
    search_placeholder: 'Search for task, area or text',
    overview: 'Overview',
    open_tasks_count: 'open tasks',
    bids_count: 'offers placed',
    trust_title: 'Safety on a local scale',
    trust_1: 'Profile required before tasks and offers',
    trust_2: 'Private only - company posts do not belong here',
    trust_3: 'Payment agreed directly between creator and helper',
    trust_4: 'Contact details shared only upon acceptance',
    trust_5: 'Tasks are local to Trøjborg',
    trust_6: 'Tasks stored online and shared across users',
    open_tasks_title: 'Open tasks near Trøjborg',
    open_tasks_prefix: 'Open tasks',
    no_tasks: 'No tasks match your search right now.',
    tasks_count_suffix: 'shown',
    tasks_in_category: 'task(s) in',
    interest_eyebrow: 'Interest List',
    interest_title: 'Get notified about relevant tasks',
    interest_desc: 'Select the types of tasks you would like to hear about...',
    interest_email_label: 'Email',
    interest_legend: 'I would like to hear about',
    interest_submit: 'Save interest',
    contact_eyebrow: 'Contact',
    contact_title: 'Questions or feedback?',
    contact_desc: 'Write to us if you have ideas, questions or want to help...',
    send_mail_btn: '✉️ Send email',
    sponsor_title: 'Want to reach local people in Trøjborg?',
    sponsor_desc: 'We open for a few relevant local sponsors...',
    sponsor_btn: '✉️ Inquire about sponsorship',
    login_btn: 'Log in / Sign up',
    logout_btn: 'Switch profile',
    budget_label: 'Budget',
    bids_label: 'offers',
    latest_bids: 'Latest offers',
    no_bids: 'No offers yet.',
    bid_btn: 'Make offer',
    delete_btn: 'Delete',
    guide_btn: '📖 Guide',
    guide_title: '📖 Guide to Trøjborg-appen',
    guide_subtitle: 'Get an overview of how to use Trøjborg-appen and post tasks.',
    tab_webapp: '📱 Webapp on phone',
    tab_task: '📝 Post a task',
    open_full_img: '🔍 Open full size image'
  }
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
  toastContainer: document.querySelector('#toastContainer'),
  emailDialog: document.querySelector('#emailDialog'),
  emailForm: document.querySelector('#emailForm'),
  emailSenderName: document.querySelector('#emailSenderName'),
  emailSenderAddress: document.querySelector('#emailSenderAddress'),
  emailSubject: document.querySelector('#emailSubject'),
  emailMessage: document.querySelector('#emailMessage'),
  emailStatus: document.querySelector('#emailStatus'),
  guideDialog: document.querySelector('#guideDialog')
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

  const taskUpdateChannel = sb
    .channel('tasks-update-realtime')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => handleTaskUpdate(payload.new)
    )
    .subscribe();

  state.realtimeChannels.push(taskUpdateChannel);

  const taskInsertChannel = sb
    .channel('tasks-insert-realtime')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => handleNewTaskRealtime(payload.new)
    )
    .subscribe();

  state.realtimeChannels.push(taskInsertChannel);
}

function handleNewTaskRealtime(newTask) {
  if (!newTask) return;
  const formattedTask = {
    id: newTask.id,
    title: newTask.title,
    category: newTask.category,
    area: newTask.area,
    budget: newTask.budget,
    time: newTask.time,
    description: newTask.description,
    owner: newTask.owner_name,
    ownerEmail: newTask.owner_email,
    ownerNote: 'Lokal bruger',
    contact: newTask.contact,
    createdAt: newTask.created_at,
    awardedTo: newTask.awarded_to || null,
    bids: []
  };

  const alreadyExists = state.tasks.some(t => t.id === formattedTask.id);
  if (!alreadyExists) {
    state.tasks.unshift(formattedTask);
    render();

    const userCategories = getUserCategories();
    if (userCategories.includes(formattedTask.category)) {
      updateRedDotBadge(true);
      showToast(
        'info',
        `🔴 Ny opgave i "${formattedTask.category}"`,
        `${formattedTask.title} (${formattedTask.area || 'Trøjborg'})`
      );
    }
  }
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

function setLanguage(lang) {
  state.lang = lang;
  writeLocal('trojborg-lang', lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const t = i18n[lang] || i18n.da;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key]) el.placeholder = t[key];
  });

  document.querySelectorAll('[data-cat-key]').forEach(el => {
    const key = el.dataset.catKey;
    const catMap = categoryLabels[lang] || categoryLabels.da;
    if (catMap[key]) el.textContent = catMap[key];
  });

  render();
}

function renderAccount() {
  const t = i18n[state.lang] || i18n.da;
  if (!state.user) {
    elements.accountArea.innerHTML = `<button class="secondary" type="button" id="loginButton">${t.login_btn}</button>`;
    document.querySelector('#loginButton').addEventListener('click', () => elements.authDialog.showModal());
    return;
  }

  elements.accountArea.innerHTML = `
    <div class="profile-chip">
      <span class="avatar">${state.user.name.slice(0, 1).toUpperCase()}</span>
      <span>${escapeHtml(state.user.name)}</span>
    </div>
    <button class="secondary" type="button" id="logoutButton">${t.logout_btn}</button>
  `;
  document.querySelector('#logoutButton').addEventListener('click', () => elements.authDialog.showModal());
}

const categoryIcons = {
  'Alle': '🏷️',
  'Have og gård': '🌿',
  'Indkøb': '🛒',
  'Reparationer': '🛠️',
  'Dyr': '🐕',
  'Børn': '👶',
  'Andet': '✨'
};

function renderFilters() {
  const catMap = categoryLabels[state.lang] || categoryLabels.da;

  elements.categoryFilters.innerHTML = categories.map(category => `
    <button class="filter-button ${category === state.activeCategory ? 'active' : ''}" type="button" data-category="${category}">
      <span>${categoryIcons[category] || '🏷️'}</span>
      <span>${catMap[category] || category}</span>
    </button>
  `).join('');

  elements.categoryFilters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const isNew = state.activeCategory !== button.dataset.category;
      state.activeCategory = button.dataset.category;
      render();

      if (isNew) {
        const board = document.querySelector('.task-board');
        if (board) {
          board.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  elements.taskCategory.innerHTML = categories
    .filter(category => category !== 'Alle')
    .map(category => `<option value="${category}">${categoryIcons[category] || ''} ${catMap[category] || category}</option>`)
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
  const t = i18n[state.lang] || i18n.da;
  const catMap = categoryLabels[state.lang] || categoryLabels.da;
  
  const boardHeadTitle = document.querySelector('.board-head h2');
  if (boardHeadTitle) {
    const isHidden = !state.hasUnreadBadge;
    const count = state.unreadCount || 1;
    const badgeText = count > 0 ? `${count} ny${count > 1 ? 'e' : ''}` : 'Ny';
    const dotHtml = `<span class="red-notification-dot ${isHidden ? 'hidden' : ''}" id="tasksNotificationDot" title="Nye opgaver i dine kategorier">${badgeText}</span>`;
    if (state.activeCategory && state.activeCategory !== 'Alle') {
      const icon = categoryIcons[state.activeCategory] || '🏷️';
      const catLabel = catMap[state.activeCategory] || state.activeCategory;
      boardHeadTitle.innerHTML = `${t.open_tasks_prefix} <span class="category-pop-header">${icon} ${escapeHtml(catLabel)}</span> ${dotHtml}`;
    } else {
      boardHeadTitle.innerHTML = `${t.open_tasks_title} ${dotHtml}`;
    }
  }

  if (state.activeCategory && state.activeCategory !== 'Alle') {
    const catLabel = catMap[state.activeCategory] || state.activeCategory;
    elements.resultText.textContent = `${tasks.length} ${t.tasks_in_category} ${catLabel}`;
  } else {
    elements.resultText.textContent = `${tasks.length} ${t.tasks_count_suffix}`;
  }

  elements.openCount.textContent = state.tasks.length;
  elements.bidCount.textContent = state.tasks.reduce((total, task) => total + task.bids.length, 0);

  if (state.loading) {
    elements.taskList.innerHTML = '<div class="empty-state">Henter opgaver...</div>';
    return;
  }

  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">${t.no_tasks}</div>`;
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

// ─── Toast notification ───

function showSimpleToast(message, duration = 4000) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ─── Notify subscribers ───

async function notifySubscribers(task) {
  try {
    const { data: subs, error } = await sb
      .from('subscriptions')
      .select('email, categories')
      .contains('categories', [task.category]);

    if (error) {
      console.warn('Fejl ved søgning i Supabase subscriptions:', error);
      return;
    }

    if (!subs || subs.length === 0) {
      console.log(`Ingen abonnenter fundet for kategorien "${task.category}"`);
      return;
    }

    // Send e-mail notifikation til alle abonnenter i denne kategori
    for (const sub of subs) {
      if (!sub.email) continue;
      fetch(sharedEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'notification',
          subscriberEmail: sub.email,
          taskTitle: task.title,
          taskCategory: task.category,
          taskArea: task.area || 'Trøjborg',
          taskBudget: task.budget || 'Ikke angivet',
          taskOwner: task.owner
        })
      }).catch(err => console.warn('Notifikations-fejl for', sub.email, err));
    }

    showSimpleToast(`Notifikation sendt til ${subs.length} interesserede i "${task.category}"`);
  } catch (err) {
    console.warn('Notifikation fejlede:', err);
  }
}

// ─── Notification Badge & Unread Logic ───

function getUserCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem('trojborg-interest-signups') || '[]');
    if (Array.isArray(saved) && saved.length > 0) {
      const cats = saved[saved.length - 1].categories;
      if (Array.isArray(cats) && cats.length > 0) {
        return cats;
      }
    }
  } catch (e) {}
  return ['Have og gård', 'Indkøb', 'Reparationer', 'Dyr', 'Børn', 'Andet'];
}

function getSeenTaskIds() {
  try {
    const saved = JSON.parse(localStorage.getItem('trojborg-seen-task-ids') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function checkUnreadNotificationBadge() {
  const userCategories = getUserCategories();
  if (!state.tasks || !state.tasks.length) {
    updateRedDotBadge(false, 0);
    return;
  }

  const seenIds = getSeenTaskIds();

  const unreadTasks = state.tasks.filter(task => {
    if (!userCategories.includes(task.category)) return false;
    if (seenIds.length === 0) {
      const taskTime = task.createdAt ? new Date(task.createdAt).getTime() : Date.now();
      return (Date.now() - taskTime) < (48 * 60 * 60 * 1000);
    }
    return !seenIds.includes(String(task.id));
  });

  updateRedDotBadge(unreadTasks.length > 0, unreadTasks.length);
}

function updateRedDotBadge(show, count = 1) {
  state.hasUnreadBadge = Boolean(show);
  state.unreadCount = count;

  document.querySelectorAll('.red-notification-dot').forEach(dot => {
    dot.classList.toggle('hidden', !show);
    const badgeText = count > 0 ? `${count} ny${count > 1 ? 'e' : ''}` : 'Ny';
    dot.textContent = badgeText;
  });

  if (show) {
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(count || 1).catch(() => {});
    }
  } else {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  }
}

function markTasksAsRead() {
  if (!state.tasks) return;
  const currentIds = state.tasks.map(t => String(t.id));
  const seenIds = getSeenTaskIds();
  const updatedSeen = Array.from(new Set([...seenIds, ...currentIds]));
  localStorage.setItem('trojborg-seen-task-ids', JSON.stringify(updatedSeen));
  updateRedDotBadge(false);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.red-notification-dot')) {
    markTasksAsRead();
  }
});

function render() {
  renderAccount();
  renderFilters();
  renderTasks();
  checkUnreadNotificationBadge();
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

document.querySelectorAll('.open-guide-btn').forEach(button => {
  button.addEventListener('click', () => {
    if (elements.guideDialog) {
      if (typeof elements.guideDialog.showModal === 'function' && elements.guideDialog.tagName === 'DIALOG') {
        elements.guideDialog.showModal();
      } else {
        elements.guideDialog.classList.remove('hidden');
      }
    }
  });
});

document.querySelectorAll('.guide-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    const targetTab = tabBtn.dataset.tab;
    document.querySelectorAll('.guide-tab').forEach(b => {
      const isActive = b.dataset.tab === targetTab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    const webappPanel = document.querySelector('#guidePanelWebapp');
    const taskPanel = document.querySelector('#guidePanelTask');
    if (webappPanel && taskPanel) {
      if (targetTab === 'webapp') {
        webappPanel.style.display = 'block';
        taskPanel.style.display = 'none';
      } else {
        webappPanel.style.display = 'none';
        taskPanel.style.display = 'block';
      }
    }
  });
});

document.querySelectorAll('.close-dialog').forEach(button => {
  button.addEventListener('click', event => {
    const dialog = event.target.closest('dialog') || event.target.closest('.custom-guide-modal-overlay');
    if (dialog) {
      if (dialog.tagName === 'DIALOG' && typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.classList.add('hidden');
      }
    }
  });
});

const guideDialogEl = document.getElementById('guideDialog');
if (guideDialogEl) {
  guideDialogEl.addEventListener('click', (e) => {
    if (e.target === guideDialogEl) {
      guideDialogEl.classList.add('hidden');
    }
  });
}

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

    // Notify subscribers in background
    notifySubscribers(savedTask).catch(() => {});
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

// ─── E-mail Pop-up Modal Event Handlers ───

document.querySelectorAll('.open-email-button').forEach(button => {
  button.addEventListener('click', () => {
    if (state.user) {
      if (elements.emailSenderName) elements.emailSenderName.value = state.user.name || '';
      if (elements.emailSenderAddress) elements.emailSenderAddress.value = state.user.email || '';
    }
    if (button.dataset.subject && elements.emailSubject) {
      elements.emailSubject.value = button.dataset.subject;
    }
    if (elements.emailStatus) {
      elements.emailStatus.textContent = '';
      elements.emailStatus.classList.remove('is-error');
    }
    if (elements.emailDialog) {
      elements.emailDialog.showModal();
    }
  });
});

if (elements.emailForm) {
  elements.emailForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = elements.emailForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sender...';

    const name = elements.emailSenderName ? elements.emailSenderName.value.trim() : '';
    const email = elements.emailSenderAddress ? elements.emailSenderAddress.value.trim() : '';
    const subject = elements.emailSubject ? elements.emailSubject.value : 'Spørgsmål eller feedback';
    const message = elements.emailMessage ? elements.emailMessage.value.trim() : '';

    const payload = {
      type: 'contact',
      name: name,
      email: email,
      subject: subject,
      message: message,
      createdAt: new Date().toISOString()
    };

    try {
      if (sharedEndpoint) {
        await fetch(sharedEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      }
      if (elements.emailStatus) {
        elements.emailStatus.textContent = 'Tak for din besked! Din mail er sendt.';
        elements.emailStatus.classList.remove('is-error');
      }
      elements.emailForm.reset();

      setTimeout(() => {
        if (elements.emailDialog) elements.emailDialog.close();
        if (elements.emailStatus) elements.emailStatus.textContent = '';
      }, 2000);
    } catch (error) {
      console.warn('Kunne ikke sende via server, åbner mailprogram:', error);
      const mailtoUrl = `mailto:jensenhp79@gmail.com?cc=hpj8260@yahoo.dk&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Fra: ' + name + ' (' + email + ')\n\n' + message)}`;
      window.location.href = mailtoUrl;
      if (elements.emailDialog) elements.emailDialog.close();
    }

    submitButton.disabled = false;
    submitButton.textContent = 'Send mail';
  });
}

// ─── Language Switcher Handlers ───

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

// ─── Init ───

(async function init() {
  setLanguage(state.lang);
  state.tasks = await loadTasks();
  state.loading = false;
  render();
  setupRealtimeSubscriptions();
})();
