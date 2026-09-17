/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG PANEL GUARD — Smart Panel is the source of truth.
 * - Sheets are panel-written only: manual edits get reverted (Code.js
 *   onEdit, simple trigger) + a native "warning" protection that pops
 *   a warning on hand edits but never blocks script writes.
 * - Deletes need owner permission: row/sheet deletes can't be blocked
 *   by Google, so they are DETECTED (installable onChange, runs as
 *   owner), logged to Audit_Log, and the owner is emailed. The
 *   sanctioned path is requestMerchantDelete() → owner approves →
 *   soft-delete (Pipeline = Lost, history preserved).
 *
 * OWNER ONE-TIME SETUP (run from the editor as usernamepgbc@gmail.com):
 *   1. applyPanelProtections()
 *   2. installPanelGuardTriggers()
 * ═══════════════════════════════════════════════════════════════════
 */

var PANEL_GUARD_OWNER = 'usernamepgbc@gmail.com';
var PANEL_GUARD_SHEETS = ['Merchants', 'Activities', 'Meetings', 'Feedback', 'Follow Ups', 'Follow_Ups',
  'Dashboard', '_DashData', 'Email_Queue', 'Email_Logs', 'Email_Settings',
  'Branches', 'Onboarding', 'Reports', 'Settings', 'Reference Lists', 'Lists'];
var PANEL_GUARD_AUDIT = 'Audit_Log';
var PANEL_GUARD_TAG = 'NEXG Panel Guard';

/** Creates Audit_Log if missing. Never throws. */
function ensureAuditLog_() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(PANEL_GUARD_AUDIT);
    if (!sheet) {
      sheet = ss.insertSheet(PANEL_GUARD_AUDIT);
      sheet.appendRow(['Timestamp', 'Actor', 'Event', 'Sheet', 'Detail', 'Status']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#111116').setFontColor('#d4af37');
      sheet.setFrozenRows(1);
    }
    return sheet;
  } catch (e) { return null; }
}

function guardLog_(actor, event, sheetName, detail, status) {
  try {
    var sheet = ensureAuditLog_();
    if (!sheet) return;
    sheet.appendRow([new Date(), actor || '', event || '', sheetName || '', detail || '', status || '']);
  } catch (e) {}
}

function guardActor_() {
  var active = '', effective = '';
  try { active = Session.getActiveUser().getEmail() || ''; } catch (e) {}
  try { effective = Session.getEffectiveUser().getEmail() || ''; } catch (e) {}
  if (active && effective && active !== effective) return active + ' (runs as ' + effective + ')';
  return active || effective || 'unknown';
}

/**
 * OWNER: adds warning-only protections on every data tab (header row +
 * ID column). Manual edits show a warning; Smart Panel script writes
 * are unaffected. Safe to re-run (cleans up its own old protections).
 */
function applyPanelProtections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var me = '';
  try { me = Session.getEffectiveUser().getEmail() || ''; } catch (e) {}
  var cleaned = 0, applied = 0;
  PANEL_GUARD_SHEETS.forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;
    try {
      sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
        try { if (String(p.getDescription() || '').indexOf(PANEL_GUARD_TAG) === 0) { p.remove(); cleaned++; } } catch (e) {}
      });
      sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (p) {
        try { if (String(p.getDescription() || '').indexOf(PANEL_GUARD_TAG) === 0) { p.remove(); cleaned++; } } catch (e) {}
      });
    } catch (e) {}
    try {
      var lastCol = Math.max(sheet.getMaxColumns(), 1);
      var head = sheet.getRange(1, 1, 1, lastCol).protect()
        .setDescription(PANEL_GUARD_TAG + ' — header row: panel-only');
      head.setWarningOnly(true);
      applied++;
    } catch (e) {}
    try {
      var lastRow = Math.max(sheet.getLastRow(), 2);
      var ids = sheet.getRange(1, 1, lastRow, 1).protect()
        .setDescription(PANEL_GUARD_TAG + ' — ID column: panel-only');
      ids.setWarningOnly(true);
      applied++;
    } catch (e) {}
  });
  try { ss.toast('Panel Guard: ' + applied + ' warning protections applied (' + cleaned + ' old removed). Manual edits now warn; panel writes unaffected.', '🛡️ Panel Guard', 6); } catch (e) {}
  guardLog_(me, 'PROTECTIONS_APPLIED', '', 'applied=' + applied + ' cleaned=' + cleaned, 'OK');
  return { applied: applied, cleaned: cleaned };
}

/**
 * OWNER: installs installable triggers so the guard runs AS THE OWNER
 * (full auth: can write Audit_Log + email alerts even when a teammate
 * triggers the event). Safe to re-run (removes its own old triggers).
 */
function installPanelGuardTriggers() {
  var count = 0;
  try {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      try {
        if (t.getHandlerFunction() === 'guardOnEdit' || t.getHandlerFunction() === 'guardOnChange') {
          ScriptApp.deleteTrigger(t); count++;
        }
      } catch (e) {}
    });
    ScriptApp.newTrigger('guardOnEdit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onEdit().create();
    ScriptApp.newTrigger('guardOnChange').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onChange().create();
  } catch (e) {
    throw new Error('installPanelGuardTriggers failed: ' + e.message);
  }
  try { SpreadsheetApp.getActiveSpreadsheet().toast('Panel Guard triggers installed (guardOnEdit + guardOnChange, running as owner).', '🛡️ Panel Guard', 6); } catch (e) {}
  guardLog_(guardActor_(), 'TRIGGERS_INSTALLED', '', 'removed=' + count, 'OK');
  return 'Installed guardOnEdit + guardOnChange.';
}

/**
 * Installable onEdit (runs as owner). Reverts hand edits on locked tabs
 * like the simple onEdit in Code.js, and logs the attempt. Script writes
 * never fire this trigger, so the panel keeps working.
 */
function guardOnEdit(e) {
  if (!e || !e.source) return;
  var sheet;
  try { sheet = e.source.getActiveSheet(); } catch (err) { return; }
  if (!sheet || PANEL_GUARD_SHEETS.indexOf(sheet.getName()) === -1) return;
  var actor = guardActor_();
  if (PANEL_GUARD_OWNER && actor.indexOf(PANEL_GUARD_OWNER) !== -1) return;
  try {
    var range = e.range;
    if (!range) return;
    if (e.oldValue !== undefined) { range.setValue(e.oldValue); }
    else { try { range.clearContent(); } catch (x) {} }
  } catch (err) {}
  guardLog_(actor, 'EDIT_REVERTED', sheet.getName(), 'range=' + (e.range ? e.range.getA1Notation() : '?'), 'REVERTED');
  try { e.source.toast('This sheet is locked. Use 🚀 NEXG CRM → Open Smart Panel.', '🔒 Sheet Protected', 5); } catch (err) {}
}

/**
 * Installable onChange (runs as owner). Detects structural changes the
 * simple onEdit can never see: row/column/sheet deletes. Google cannot
 * block an Editor's delete — so we log it + alert the owner immediately.
 */
function guardOnChange(e) {
  if (!e) return;
  var type = '';
  try { type = String(e.changeType || ''); } catch (err) {}
  if (!type) return;
  var actor = guardActor_();
  var watch = ['REMOVE_ROW', 'REMOVE_COLUMN', 'REMOVE_GRID', 'INSERT_ROW', 'INSERT_COLUMN', 'OTHER'];
  if (watch.indexOf(type) === -1) return;
  var sheetName = '';
  try { sheetName = e.source ? e.source.getActiveSheet().getName() : ''; } catch (err) {}
  var isDelete = type.indexOf('REMOVE_') === 0;
  guardLog_(actor, type, sheetName, isDelete ? 'Delete needs owner permission — review immediately.' : 'Structure change.', isDelete ? 'NEEDS_REVIEW' : 'LOGGED');
  if (!isDelete) return;
  try {
    var admin = '';
    try { admin = EmailConfig.adminEmail() || PANEL_GUARD_OWNER; } catch (err) { admin = PANEL_GUARD_OWNER; }
    Email.send('SYSTEM_ALERT', admin, {
      alert_type: 'Sheet delete detected',
      alert_message: actor + ' triggered ' + type + ' on ' + (sheetName || 'unknown sheet') + '. Deletes need owner permission — verify in Audit_Log and restore if needed.',
      timestamp: new Date().toString()
    }, { merchantId: '', employeeId: '', eventId: '' });
  } catch (err) {}
  try { e.source.toast('⚠️ ' + type + ' detected — logged to Audit_Log and owner notified. Deletes need permission.', '🛡️ Panel Guard', 6); } catch (err) {}
}

/** Opens Audit_Log for review. */
function openAuditLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureAuditLog_();
  if (sheet) ss.setActiveSheet(sheet);
}

/**
 * TEAM (panel path): request a merchant delete. Writes a PENDING request
 * to Audit_Log + notifies the owner. Nothing is deleted until the owner
 * runs approveMerchantDelete(requestId). Returns the request ID.
 */
function requestMerchantDelete(merchantId, reason) {
  merchantId = String(merchantId || '').trim();
  reason = String(reason || '').trim();
  if (!merchantId) throw new Error('requestMerchantDelete: merchantId is required.');
  if (!reason) throw new Error('requestMerchantDelete: reason is required.');
  var actor = guardActor_();
  var name = merchantId;
  try {
    var row = findMerchantRow_(merchantId);
    if (row > 0) {
      var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Merchants');
      name = String(sh.getRange(row, 2).getValue() || merchantId);
    }
  } catch (e) {}
  var reqId = 'DEL-' + Date.now();
  guardLog_(actor, 'DELETE_REQUESTED', 'Merchants', reqId + ' | ' + name + ' (' + merchantId + ') | reason: ' + reason, 'PENDING');
  try {
    var admin = '';
    try { admin = EmailConfig.adminEmail() || PANEL_GUARD_OWNER; } catch (e) { admin = PANEL_GUARD_OWNER; }
    Email.send('SYSTEM_ALERT', admin, {
      alert_type: 'Delete approval needed',
      alert_message: actor + ' requested delete of ' + name + ' (' + merchantId + '). Reason: ' + reason + '. Request: ' + reqId + '. Run approveMerchantDelete("' + reqId + '") to soft-delete, or reject in Audit_Log.',
      timestamp: new Date().toString()
    }, { merchantId: merchantId, employeeId: '', eventId: reqId });
  } catch (e) {}
  return reqId;
}

/**
 * OWNER: approves a delete request. Soft-delete only: sets Pipeline to
 * Lost, appends the reason to Notes, marks request APPROVED, and sends
 * the MERCHANT_DELETED internal email. History (Activities/Meetings) is
 * preserved. Physical row removal, if ever wanted, is done by the owner
 * by hand afterwards.
 */
function approveMerchantDelete(requestId) {
  requestId = String(requestId || '').trim();
  if (!requestId) throw new Error('approveMerchantDelete: requestId is required.');
  EmailAdmin.assertAccess();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var audit = ensureAuditLog_();
  if (!audit || audit.getLastRow() < 2) throw new Error('No delete requests found.');
  var rows = audit.getRange(2, 1, audit.getLastRow() - 1, 6).getValues();
  var reqRow = -1, merchantId = '', reason = '', requester = '';
  for (var i = 0; i < rows.length; i++) {
    var ev = String(rows[i][2] || '');
    var st = String(rows[i][5] || '');
    var detail = String(rows[i][4] || '');
    if (ev === 'DELETE_REQUESTED' && st === 'PENDING' && detail.indexOf(requestId) === 0) {
      var m = detail.match(/\(([^)]+)\)/);
      merchantId = m ? m[1] : '';
      var r = detail.match(/reason:\s*(.*)$/);
      reason = r ? r[1] : '';
      requester = String(rows[i][1] || '');
      reqRow = i + 2;
      break;
    }
  }
  if (reqRow < 0) throw new Error('Request ' + requestId + ' not found or not PENDING.');
  var name = merchantId;
  try {
    var row = findMerchantRow_(merchantId);
    if (row < 0) throw new Error('Merchant ' + merchantId + ' not found.');
    var sh = ss.getSheetByName('Merchants');
    name = String(sh.getRange(row, 2).getValue() || merchantId);
    sh.getRange(row, 18).setValue('Lost');
    var notes = String(sh.getRange(row, 24).getValue() || '');
    sh.getRange(row, 24).setValue((notes ? notes + '\n' : '') + '[DELETED ' + new Date().toISOString().slice(0, 10) + ' by ' + guardActor_() + ' | req ' + requestId + ' | reason: ' + reason + ']');
    sh.getRange(row, 26).setValue(new Date());
  } catch (e) { throw new Error('approveMerchantDelete failed: ' + e.message); }
  try { audit.getRange(reqRow, 6).setValue('APPROVED'); } catch (e) {}
  guardLog_(guardActor_(), 'DELETE_APPROVED', 'Merchants', requestId + ' | ' + name + ' (' + merchantId + ')', 'APPROVED');
  try {
    var admin = '';
    try { admin = EmailConfig.adminEmail() || PANEL_GUARD_OWNER; } catch (e) { admin = PANEL_GUARD_OWNER; }
    Email.send('MERCHANT_DELETED', admin, {
      business_name: name, merchant_id: merchantId, deleted_by: guardActor_(), reason: reason || 'approved ' + requestId
    }, { merchantId: merchantId, employeeId: '', eventId: requestId });
  } catch (e) {}
  try { ss.toast('Soft-deleted ' + name + ' (Pipeline → Lost). History preserved.', '🗑️ Delete approved', 6); } catch (e) {}
  return { requestId: requestId, merchantId: merchantId, name: name };
}
