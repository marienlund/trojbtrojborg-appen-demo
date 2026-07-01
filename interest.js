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

  function showMailFallback(mailtoUrl, gmailUrl, mailText) {
    status.textContent = "";
    status.classList.remove("is-error");

    const intro = document.createElement("span");
    intro.textContent = "Tilmeldingen er gemt. Hvis mailen ikke åbner automatisk, vælg en af mulighederne her:";

    const actions = document.createElement("span");
    actions.className = "interest-status-actions";

    const mailLink = document.createElement("a");
    mailLink.href = mailtoUrl;
    mailLink.textContent = "Åbn mail";

    const gmailLink = document.createElement("a");
    gmailLink.href = gmailUrl;
    gmailLink.target = "_blank";
    gmailLink.rel = "noopener";
    gmailLink.textContent = "Åbn Gmail";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Kopiér tekst";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(mailText);
        copyButton.textContent = "Tekst kopieret";
      } catch (error) {
        copyButton.textContent = "Kunne ikke kopiere";
      }
    });

    actions.append(mailLink, gmailLink, copyButton);
    status.append(intro, actions);
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
    const subjectText = "Interesseliste - Trøjborg-appen";
    const mailText = [
      "Hej Trøjborg-appen",
      "",
      "Jeg vil gerne på interesselisten.",
      "",
      `Email: ${signup.email}`,
      `Interesser: ${categories.join(", ")}`,
      "",
      "Venlig hilsen"
    ].join("\n");
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(mailText);
    const mailtoUrl = `mailto:kontakt@trojborgappen.dk?subject=${subject}&body=${body}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=kontakt@trojborgappen.dk&su=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
    showMailFallback(mailtoUrl, gmailUrl, mailText);
  });
})();
