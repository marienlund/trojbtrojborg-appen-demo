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
    form.querySelectorAll('input[name="interestCategory"], input[name="Interesser"]').forEach((checkbox) => {
      checkbox.checked = (latestSignup.categories || []).includes(checkbox.value);
    });
    setStatus("Dine interesser er gemt i denne browser.", false);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const categories = Array.from(form.querySelectorAll('input[name="interestCategory"]:checked, input[name="Interesser"]:checked'))
      .map((checkbox) => checkbox.value);

    if (!categories.length) {
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

    const subject = encodeURIComponent("Interesseliste - Trøjborg-appen");
    const body = encodeURIComponent([
      "Hej Trøjborg-appen",
      "",
      "Jeg vil gerne på interesselisten.",
      "",
      `Email: ${signup.email}`,
      `Interesser: ${categories.join(", ")}`,
      "",
      "Venlig hilsen"
    ].join("\n"));

    window.location.href = `mailto:kontakt@trojborgappen.dk?subject=${subject}&body=${body}`;
    setStatus("Åbner din mail med tilmeldingen klar.", false);
  });
})();
