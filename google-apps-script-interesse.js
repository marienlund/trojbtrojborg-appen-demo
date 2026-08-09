const SPREADSHEET_ID = "1nEwBvy2xW5ZXrGuEX_sqNwGlREMMzSOCnLa83Lp-gbo";
const SHEET_NAME = "Interesseliste";
const NOTIFY_EMAIL = "kontakt@trojborgappen.dk";

function doGet() {
  const sheet = getOrCreateSheet();
  sheet.appendRow([new Date().toISOString(), "TEST FRA LINK", "Direkte test"]);

  return ContentService
    .createTextOutput("Test ok - der er skrevet til Google Sheet")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");

  if (data.type === "contact") {
    return saveContact(data);
  }

  const sheet = getOrCreateSheet(SHEET_NAME, ["Tidspunkt", "Email", "Interesser"]);
  const email = data.email || "";
  const categories = Array.isArray(data.categories) ? data.categories.join(", ") : "";
  const createdAt = data.createdAt || new Date().toISOString();

  sheet.appendRow([createdAt, email, categories]);

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Ny interesse i Trøjborg-appen",
      body: [
        "Der er kommet en ny interessetilmelding.",
        "",
        `Email: ${email}`,
        `Interesser: ${categories}`,
        `Tidspunkt: ${createdAt}`
      ].join("\n")
    });
  } catch (err) {}

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveContact(data) {
  const sheet = getOrCreateSheet("Kontaktbeskeder", ["Tidspunkt", "Navn", "Email", "Emne", "Besked"]);
  const name = data.name || "";
  const email = data.email || "";
  const subject = data.subject || "Kontakt fra Trøjborg-appen";
  const message = data.message || "";
  const createdAt = data.createdAt || new Date().toISOString();

  sheet.appendRow([createdAt, name, email, subject, message]);

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `Ny mail: ${subject}`,
      body: [
        "Der er modtaget en ny besked fra Trøjborg-appen:",
        "",
        `Navn: ${name}`,
        `Email: ${email}`,
        `Emne: ${subject}`,
        "",
        "Besked:",
        message,
        "",
        `Tidspunkt: ${createdAt}`
      ].join("\n")
    });
  } catch (err) {}

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName || SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName || SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers || ["Tidspunkt", "Email", "Interesser"]);
  }

  return sheet;
}
