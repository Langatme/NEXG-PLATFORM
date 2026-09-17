/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG Smart Panel – Main Entry Point (Code.gs)
 * Sidebar + Dashboard launchers + the sheet-lock that makes the
 * Smart Panel the single source of truth.
 * ═══════════════════════════════════════════════════════════════════
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🚀 NEXG CRM')
      .addItem('Open Smart Panel', 'openSmartPanel')
      .addSeparator()
      .addItem('📊 Dashboard (full screen)', 'openDashboard')
      .addItem('✉️ Email Control Center', 'openEmailCenterDialog')
      .addSeparator()
      .addItem('📈 Dashboard Sheet', 'openDashboardSheet')
      .addItem('🔧 Rebuild Dashboard Sheet', 'buildDashboardSheet')
      .addSeparator()
      .addItem('⚙️ Apply Sheet Validation & Dropdowns', 'applySheetValidation')
      .addItem('Refresh Active Merchant', 'refreshActiveMerchant')
      .addSeparator()
      .addItem('🛡️ Apply Panel Protections (owner, once)', 'applyPanelProtections')
      .addItem('🛡️ Install Guard Triggers (owner, once)', 'installPanelGuardTriggers')
      .addItem('🧾 Open Audit Log', 'openAuditLog')
      .addToUi();
  } catch (e) {
    console.warn('onOpen UI not available: ' + e.message);
  }
}

/**
 * 🔒 SHEET LOCK — makes the Smart Panel the only way to change data.
 * Fires on MANUAL edits only; script writes (the panel) never trigger it,
 * so the panel keeps working while hand-typed changes get reverted.
 */
function onEdit(e) {
  if (!e || !e.source) return;

  // Every data tab is locked. Colleagues shared as Editors do ALL work
  // through the Smart Panel / Dashboard — hand edits here are reverted.
  // Scratch tabs with any other name stay freely editable.
  var LOCKED = ['Merchants', 'Activities', 'Meetings', 'Feedback', 'Follow Ups', 'Follow_Ups',
    'Dashboard', '_DashData', 'Email_Queue', 'Email_Logs', 'Email_Settings',
    'Branches', 'Onboarding', 'Reports', 'Settings', 'Reference Lists', 'Lists'];
  var sheet = e.source.getActiveSheet();
  if (LOCKED.indexOf(sheet.getName()) === -1) return;

  // OWNER ESCAPE HATCH — the script owner keeps direct-edit access for
  // emergency fixes. Everyone else is panel-only. (If Apps Script cannot
  // resolve your email, the sheet stays locked for you too — use the panel.)
  var OWNER = 'usernamepgbc@gmail.com';
  if (OWNER) {
    try { if (Session.getActiveUser().getEmail() === OWNER) return; } catch (x) {}
  }

  var range = e.range;
  if (e.oldValue !== undefined) { range.setValue(e.oldValue); }
  else { try { range.clearContent(); } catch (x) {} }

  e.source.toast('This sheet is locked. Use 🚀 NEXG CRM → Open Smart Panel to add or edit data.', '🔒 Sheet Protected', 5);
}

/** Opens the Smart Panel sidebar. Run from the sheet menu, not the editor. */
function openSmartPanel() {
  let ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (e) { throw new Error('Run this from the sheet menu: 🚀 NEXG CRM → Open Smart Panel.'); }
  const html = HtmlService.createTemplateFromFile('Sidebar').evaluate().setTitle('NEXG Smart Panel');
  ui.showSidebar(html);
}

/** Opens the premium HTML dashboard as a large in-sheet dialog. */
function openDashboard() {
  let ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (e) { throw new Error('Run this from the sheet menu: 🚀 NEXG CRM → Dashboard (full screen).'); }
  const html = HtmlService.createTemplateFromFile('Dashboard').evaluate().setWidth(1280).setHeight(880).setTitle('NEXG Sales Intelligence');
  ui.showModalDialog(html, ' ');
}

/** Opens the Email Control Center as a large in-sheet dialog (admin-gated). */
function openEmailCenterDialog() {
  let ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (e) { throw new Error('Run this from the sheet menu: 🚀 NEXG CRM → Email Control Center.'); }
  try {
    EmailAdmin.assertAccess();
  } catch (err) {
    const safe = String(err.message || err).replace(/</g, '&lt;');
    ui.alert('✉️ Email Control Center\n\n' + safe + '\n\nAsk the owner to add your email:\nEmail_Settings sheet → ADMIN_USERS (comma-separated),\nor run addEmailCenterAdmin("you@domain.com") from the editor.');
    return;
  }
  const html = HtmlService.createTemplateFromFile('EmailCenter')
    .evaluate().setWidth(1280).setHeight(880).setTitle('NEXG Email Control Center');
  ui.showModalDialog(html, ' ');
}

/**
 * OWNER HELPERS — run these from the Apps Script editor (▶) as
 * usernamepgbc@gmail.com. Team members cannot run these (assertAccess).
 * After adding, teammates re-open the Sheet (or hard-refresh) and use
 * 🚀 NEXG CRM → ✉️ Email Control Center, or the Dashboard Communications card.
 */
function listEmailCenterAdmins() {
  const admins = EmailAdmin.getAdminUsers();
  console.log('Email Center admins: ' + admins.join(', '));
  return admins;
}

function addEmailCenterAdmin(email) {
  const admins = EmailAdmin.addAdminUser(email);
  console.log('Added ' + email + '. Admins now: ' + admins.join(', '));
  return admins;
}

function removeEmailCenterAdmin(email) {
  const admins = EmailAdmin.removeAdminUser(email);
  console.log('Removed ' + email + '. Admins now: ' + admins.join(', '));
  return admins;
}

/** Jumps straight to the native in-sheet Dashboard tab (builds it if missing). */
function openDashboardSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) { buildDashboardSheet(); return; }
  ss.setActiveSheet(dash);
}

/** Returns the deployed web-app URL so the dialog can pop out to its own tab. */
function getWebAppUrl() {
  try { return ScriptApp.getService().getUrl(); } catch (e) { return ''; }
}

function applySheetValidation() { setupSheetDataValidationAndHeaders(); }

function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }

function refreshActiveMerchant() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Merchants');
  if (!sheet) { ss.toast('Merchants sheet not found!', '⚠️ Error', 3); return; }
  const cell = ss.getActiveCell();
  const row = cell ? cell.getRow() : 2;
  if (row < 2) { ss.toast('Please select a merchant row (row 2+)', '⚠️ Info', 3); return; }
  const name = sheet.getRange(row, 2).getValue();
  const stage = sheet.getRange(row, 18).getValue();
  ss.toast('Active: ' + name + ' | Stage: ' + stage, '🔄 Merchant Loaded', 4);
}