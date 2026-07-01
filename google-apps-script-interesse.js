const SPREADSHEET_ID = "1nEwBvy2XW5ZXrGuEX_sqNwGlREMMzSOCnLa83Lp-gbo";
const SHEET_NAME = "Interesseliste";
const NOTIFY_EMAIL = "kontakt@trojborgappen.dk";

function doPost(e) {
  const sheet = getOrCreateSheet();
  const data = JSON.parse(e.postData.contents || "{}");
  const email = data.email || "";
  const categories = Array.isArray(data.categories) ? data.categories.join(", ") : "";
  const createdAt = data.createdAt || new Date().toISOString();

  sheet.appendRow([createdAt, email, categories]);

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

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Tidspunkt", "Email", "Interesser"]);
  }

  return sheet;
}
