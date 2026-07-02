const sharedEndpoint = "https://script.google.com/macros/s/AKfycbz7XeSSWVlZV93sOpbaHl-nwqI5cGn_-bdYY-K-z6QvfdiL7RsAc2kpnnM6D7YJDtaN/exec";

if (!sharedEndpoint) {
    return;
  }

  await fetch(sharedEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
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
    console.warn('Opgaven blev gemt lokalt, men kunne ikke sendes til den faelles liste.', error);
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
