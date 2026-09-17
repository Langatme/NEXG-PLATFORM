/**
 * NEXG CRM
 * Panel Guard — Smart Panel is the source of truth.
 * File: 45_PanelGuard.gs
 *
 * Mirrors the merchant CRM PanelGuard.js behavior, adapted to host idioms:
 * - Sheets are panel-written only: manual edits get reverted (installable
 *   guardOnEdit running as owner) + a native "warning" protection that pops
 *   a warning on hand edits but never blocks script writes.
 * - Deletes need permission: row/sheet deletes can't be blocked by Google,
 *   so they are DETECTED (installable guardOnChange, runs as owner),
 *   logged to Audit_Log, and the owner is emailed. The sanctioned path is
 *   NEXG_requestHostDelete() → owner approves → archive (lifecycleStatus =
 *   Archived, history preserved — same as NEXG.Workflows.archiveHost).
 *
 * OWNER ONE-TIME SETUP (run from the editor as usernamepgbc@gmail.com):
 *   1. NEXG_applyPanelProtections()
 *   2. NEXG_installPanelGuardTriggers()
 */

var NEXG = NEXG || {};

NEXG.PanelGuard = {
  OWNER: 'usernamepgbc@gmail.com',
  AUDIT_SHEET: 'Audit_Log',
  TAG: 'NEXG Panel Guard',

  lockedSheets: function() {
    var names = NEXG.Config.sheetNames;
    return [names.hosts, names.activities, names.meetings, names.emailLogs,
      names.settings, NEXG.EmailEngine.QUEUE_SHEET, NEXG.PanelGuard.AUDIT_SHEET];
  },

  ensureAuditLog: function() {
    try {
      var ss = NEXG.Sheets.getSpreadsheet();
      var sheet = ss.getSheetByName(NEXG.PanelGuard.AUDIT_SHEET);
      if (!sheet) {
        sheet = ss.insertSheet(NEXG.PanelGuard.AUDIT_SHEET);
        sheet.appendRow(['Timestamp', 'Actor', 'Event', 'Sheet', 'Detail', 'Status']);
        sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#111116').setFontColor('#d4af37');
        sheet.setFrozenRows(1);
      }
      return sheet;
    } catch (err) { return null; }
  },

  log: function(actor, event, sheetName, detail, status) {
    try {
      var sheet = NEXG.PanelGuard.ensureAuditLog();
      if (!sheet) return;
      sheet.appendRow([new Date(), actor || '', event || '', sheetName || '', detail || '', status || '']);
    } catch (err) {}
  },

  actor: function() {
    return NEXG.Security.getCurrentUserEmail();
  },

  ownerEmail: function() {
    try {
      var admin = PropertiesService.getScriptProperties()
        .getProperty(NEXG.Config.scriptPropertyKeys.adminEmail);
      if (admin) return String(admin).trim();
    } catch (err) {}
    return NEXG.PanelGuard.OWNER;
  },

  alertOwner: function(subject, body) {
    try {
      GmailApp.sendEmail(NEXG.PanelGuard.ownerEmail(), subject, String(body || ''));
    } catch (err) {}
  }
};

/**
 * OWNER: adds warning-only protections on every data tab (header row +
 * ID column). Manual edits show a warning; Smart Panel script writes
 * are unaffected. Safe to re-run (cleans up its own old protections).
 */
function NEXG_applyPanelProtections() {
  var ss = NEXG.Sheets.getSpreadsheet();
  var cleaned = 0, applied = 0;
  NEXG.PanelGuard.lockedSheets().forEach(function(name) {
    if (!name) return;
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;
    try {
      sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function(p) {
        try { if (String(p.getDescription() || '').indexOf(NEXG.PanelGuard.TAG) === 0) { p.remove(); cleaned++; } } catch (err) {}
      });
      sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function(p) {
        try { if (String(p.getDescription() || '').indexOf(NEXG.PanelGuard.TAG) === 0) { p.remove(); cleaned++; } } catch (err) {}
      });
    } catch (err) {}
    try {
      var lastCol = Math.max(sheet.getMaxColumns(), 1);
      sheet.getRange(1, 1, 1, lastCol).protect()
        .setDescription(NEXG.PanelGuard.TAG + ' — header row: panel-only')
        .setWarningOnly(true);
      applied++;
    } catch (err) {}
    try {
      var lastRow = Math.max(sheet.getLastRow(), 2);
      sheet.getRange(1, 1, lastRow, 1).protect()
        .setDescription(NEXG.PanelGuard.TAG + ' — ID column: panel-only')
        .setWarningOnly(true);
      applied++;
    } catch (err) {}
  });
  try { ss.toast('Panel Guard: ' + applied + ' warning protections applied (' + cleaned + ' old removed). Manual edits now warn; panel writes unaffected.', 'Panel Guard', 6); } catch (err) {}
  NEXG.PanelGuard.log(NEXG.PanelGuard.actor(), 'PROTECTIONS_APPLIED', '', 'applied=' + applied + ' cleaned=' + cleaned, 'OK');
  return NEXG.ok({ applied: applied, cleaned: cleaned });
}

/**
 * OWNER: installs installable triggers so the guard runs AS THE OWNER
 * (full auth: can write Audit_Log + email alerts even when a teammate
 * triggers the event). Safe to re-run (removes its own old triggers).
 */
function NEXG_installPanelGuardTriggers() {
  var removed = 0;
  try {
    ScriptApp.getProjectTriggers().forEach(function(t) {
      try {
        if (t.getHandlerFunction() === 'NEXG_guardOnEdit' || t.getHandlerFunction() === 'NEXG_guardOnChange') {
          ScriptApp.deleteTrigger(t); removed++;
        }
      } catch (err) {}
    });
    var ss = NEXG.Sheets.getSpreadsheet();
    ScriptApp.newTrigger('NEXG_guardOnEdit').forSpreadsheet(ss).onEdit().create();
    ScriptApp.newTrigger('NEXG_guardOnChange').forSpreadsheet(ss).onChange().create();
  } catch (err) {
    NEXG.throwError('TRIGGER_FAILED', 'installPanelGuardTriggers failed: ' + err.message);
  }
  try { NEXG.Sheets.getSpreadsheet().toast('Panel Guard triggers installed (running as owner).', 'Panel Guard', 6); } catch (err) {}
  NEXG.PanelGuard.log(NEXG.PanelGuard.actor(), 'TRIGGERS_INSTALLED', '', 'removed=' + removed, 'OK');
  return NEXG.ok({ installed: true });
}

/**
 * Installable onEdit (runs as owner). Reverts hand edits on locked tabs
 * and logs the attempt. Script writes never fire this trigger, so the
 * panel keeps working.
 */
function NEXG_guardOnEdit(e) {
  if (!e || !e.source) return;
  var sheet;
  try { sheet = e.source.getActiveSheet(); } catch (err) { return; }
  if (!sheet || NEXG.PanelGuard.lockedSheets().indexOf(sheet.getName()) === -1) return;
  var actor = NEXG.PanelGuard.actor();
  if (actor === NEXG.PanelGuard.OWNER) return;
  try {
    var range = e.range;
    if (!range) return;
    if (e.oldValue !== undefined) { range.setValue(e.oldValue); }
    else { try { range.clearContent(); } catch (x) {} }
  } catch (err) {}
  NEXG.PanelGuard.log(actor, 'EDIT_REVERTED', sheet.getName(), 'range=' + (e.range ? e.range.getA1Notation() : '?'), 'REVERTED');
  try { e.source.toast('This sheet is locked. Use NEXG CRM → Open Smart Panel.', 'Sheet Protected', 5); } catch (err) {}
}

/**
 * Installable onChange (runs as owner). Detects structural changes the
 * onEdit trigger can never see: row/column/sheet deletes. Google cannot
 * block an Editor's delete — so we log it + alert the owner immediately.
 */
function NEXG_guardOnChange(e) {
  if (!e) return;
  var type = '';
  try { type = String(e.changeType || ''); } catch (err) {}
  var watch = ['REMOVE_ROW', 'REMOVE_COLUMN', 'REMOVE_GRID', 'INSERT_ROW', 'INSERT_COLUMN', 'OTHER'];
  if (watch.indexOf(type) === -1) return;
  var actor = NEXG.PanelGuard.actor();
  var sheetName = '';
  try { sheetName = e.source ? e.source.getActiveSheet().getName() : ''; } catch (err) {}
  var isDelete = type.indexOf('REMOVE_') === 0;
  NEXG.PanelGuard.log(actor, type, sheetName,
    isDelete ? 'Delete needs owner permission — review immediately.' : 'Structure change.',
    isDelete ? 'NEEDS_REVIEW' : 'LOGGED');
  if (!isDelete) return;
  NEXG.PanelGuard.alertOwner('[NEXG] Sheet delete detected — ' + type,
    actor + ' triggered ' + type + ' on ' + (sheetName || 'unknown sheet') +
    '.\nDeletes need owner permission — verify in Audit_Log and restore if needed.');
  try { e.source.toast(type + ' detected — logged to Audit_Log and owner notified. Deletes need permission.', 'Panel Guard', 6); } catch (err) {}
}

/** Opens Audit_Log for review. */
function NEXG_openAuditLog() {
  var ss = NEXG.Sheets.getSpreadsheet();
  var sheet = NEXG.PanelGuard.ensureAuditLog();
  if (sheet) ss.setActiveSheet(sheet);
}

/**
 * TEAM (panel path): request a host delete. Writes a PENDING request to
 * Audit_Log + notifies the owner. Nothing is archived until the owner
 * runs NEXG_approveHostDelete(requestId). Returns the request ID.
 */
function NEXG_requestHostDelete(hostId, reason) {
  NEXG.Security.requirePermission('panel.use');
  hostId = String(hostId || '').trim();
  reason = String(reason || '').trim();
  if (!hostId) NEXG.throwError('VALIDATION_ERROR', 'hostId is required.');
  if (!reason) NEXG.throwError('VALIDATION_ERROR', 'reason is required.');
  var actor = NEXG.PanelGuard.actor();
  var name = hostId;
  try {
    var found = NEXG.getRepository('Hosts').findById(hostId);
    if (found.success && found.data.record) name = found.data.record.hostName || hostId;
  } catch (err) {}
  var reqId = 'DEL-' + Date.now();
  NEXG.PanelGuard.log(actor, 'DELETE_REQUESTED', NEXG.Config.sheetNames.hosts,
    reqId + ' | ' + name + ' (' + hostId + ') | reason: ' + reason, 'PENDING');
  NEXG.PanelGuard.alertOwner('[NEXG] Delete approval needed — ' + name,
    actor + ' requested archive of ' + name + ' (' + hostId + ').\nReason: ' + reason +
    '\nRequest: ' + reqId + '.\nRun NEXG_approveHostDelete("' + reqId + '") to archive, or reject in Audit_Log.');
  return reqId;
}

/**
 * OWNER (Admin/Manager): approves a delete request via the sanctioned
 * archive path — lifecycleStatus → Archived, history preserved. Physical
 * row removal, if ever wanted, is done by the owner by hand afterwards.
 */
function NEXG_approveHostDelete(requestId) {
  NEXG.Security.requirePermission('host.archive');
  requestId = String(requestId || '').trim();
  if (!requestId) NEXG.throwError('VALIDATION_ERROR', 'requestId is required.');
  var sheet = NEXG.PanelGuard.ensureAuditLog();
  if (!sheet || sheet.getLastRow() < 2) NEXG.throwError('NOT_FOUND', 'No delete requests found.');
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  var reqRow = -1, hostId = '', reason = '';
  for (var i = 0; i < rows.length; i++) {
    var ev = String(rows[i][2] || '');
    var st = String(rows[i][5] || '');
    var detail = String(rows[i][4] || '');
    if (ev === 'DELETE_REQUESTED' && st === 'PENDING' && detail.indexOf(requestId) === 0) {
      var m = detail.match(/\(([^)]+)\)/);
      hostId = m ? m[1] : '';
      var r = detail.match(/reason:\s*(.*)$/);
      reason = r ? r[1] : '';
      reqRow = i + 2;
      break;
    }
  }
  if (reqRow < 0) NEXG.throwError('NOT_FOUND', 'Request ' + requestId + ' not found or not PENDING.');
  var archived = NEXG.Workflows.archiveHost({ hostId: hostId });
  if (!archived.success) NEXG.throwError('ARCHIVE_FAILED', 'Archive failed for ' + hostId + '.');
  try { sheet.getRange(reqRow, 6).setValue('APPROVED'); } catch (err) {}
  NEXG.PanelGuard.log(NEXG.PanelGuard.actor(), 'DELETE_APPROVED', NEXG.Config.sheetNames.hosts,
    requestId + ' | (' + hostId + ') | reason: ' + reason, 'APPROVED');
  try { NEXG.Sheets.getSpreadsheet().toast('Archived ' + hostId + '. History preserved.', 'Delete approved', 6); } catch (err) {}
  return NEXG.ok({ requestId: requestId, hostId: hostId });
}
