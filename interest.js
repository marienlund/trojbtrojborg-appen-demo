(function () {
  const form = document.querySelector("#interestForm");
  const emailInput = document.querySelector("#interestEmail");
  const status = document.querySelector("#interestStatus");
  const storageKey = "trojborg-interest-signups";

  if (!form || !emailInput || !status) {
    return;
  }

  function readSignups() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  }

  const savedSignups = readSignups();
  const latestSignup = savedSignups[savedSignups.length - 1];

  if (latestSignup) {
    emailInput.value = latestSignup.email || "";
    form.querySelectorAll('input[name="Interesser"]').forEach((checkbox) => {
      checkbox.checked = (latestSignup.categories || []).includes(checkbox.value);
    });
    setStatus("Dine interesser er gemt i denne browser.", false);
  }

  form.addEventListener("submit", (event) => {
    const categories = Array.from(form.querySelectorAll('input[name="Interesser"]:checked'))
      .map((checkbox) => checkbox.value);

    if (!categories.length) {
      event.preventDefault();
      setStatus("Vælg mindst en interesse.", true);
      return;
    }

    const signups = readSignups();
    const signup = {
      email: emailInput.value.trim(),
      categories,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify([...signups, signup]));
    setStatus("Sender tilmeldingen til kontakt@trojborgappen.dk...", false);
  });
})();
