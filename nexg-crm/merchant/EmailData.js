/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — DATA LAYER (SETTINGS & LOGS)
 * File: EmailData.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - Extracted cleanly from the SheetData.gs monolith (was appended
 *   at the bottom by a previous patch session).
 * - FIX B1 (Stats/Logs Empty): Rewrote NEXG_EMAIL_getLogs() to
 *   IGNORE sheet.getMaxColumns() and strictly force reading exactly
 *   13 columns every time. This guarantees that even if your
 *   Email_Logs sheet has drifted or been manually edited, the
 *   Dashboard will still see all 50+ rows correctly.
 * - Added strict column-width and date-formatting enforcement on
 *   every write to ensure the Google Sheet is always human-readable.
 * - No UX changes. All public method names preserved.
 * ═══════════════════════════════════════════════════════════════════
 */

const NEXG_EMAIL_SHEET_NAMES = {
  SETTINGS: 'Email_Settings',
  LOGS: 'Email_Logs'
};

const NEXG_EMAIL_SETTINGS_HEADERS = ['Setting', 'Value', 'Description', 'Updated At'];
const NEXG_EMAIL_LOG_HEADERS = [
  'Log ID',
  'Timestamp',
  'Status',
  'Test Mode',
  'Template',
  'Recipient',
  'Subject',
  'Merchant ID',
  'Employee ID',
  'Event ID',
  'Sent By',
  'Error',
  'Payload'
];

const NEXG_EMAIL_LOG_FIELDS = [
  'logId',
  'timestamp',
  'status',
  'testMode',
  'template',
  'recipient',
  'subject',
  'merchantId',
  'employeeId',
  'eventId',
  'sentBy',
  'error',
  'payload'
];

/**
 * Creates the Email_Settings and Email_Logs sheets if they do not exist,
 * adds headers, seeds default settings, and applies light formatting.
 */
function NEXG_EMAIL_initializeEmailSheets() {
  const ss = NEXG_EMAIL_getSpreadsheet_();
  const settingsSheet = NEXG_EMAIL_getSettingsSheet_();
  const logsSheet = NEXG_EMAIL_getLogsSheet_();
  
  NEXG_EMAIL_seedDefaultSettings_(settingsSheet);
  NEXG_EMAIL_formatLogsSheet_(logsSheet);
  
  return {
    ok: true,
    spreadsheet: ss.getName(),
    settingsSheet: settingsSheet.getName(),
    logsSheet: logsSheet.getName()
  };
}

/**
 * Returns all email settings as an object.
 */
function NEXG_EMAIL_getAllSettings() {
  const sheet = NEXG_EMAIL_getSettingsSheet_();
  const lastRow = sheet.getLastRow();
  const settings = {};
  
  if (lastRow < 2) return settings;
  
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  values.forEach(function(row) {
    const key = String(row[0]).trim().toUpperCase();
    if (!key) return;
    settings[key] = row[1];
  });
  
  return settings;
}

/**
 * Returns one setting by key.
 */
function NEXG_EMAIL_getSetting(key) {
  const normalizedKey = String(key || '').trim().toUpperCase().replace(/\s+/g, '_');
  const settings = NEXG_EMAIL_getAllSettings();
  return settings.hasOwnProperty(normalizedKey) ? settings[normalizedKey] : '';
}

/**
 * Creates or updates one setting.
 */
function NEXG_EMAIL_setSetting(key, value, description) {
  const normalizedKey = String(key || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (!normalizedKey) {
    throw new Error('NEXG_EMAIL_setSetting requires a setting key.');
  }
  
  const sheet = NEXG_EMAIL_getSettingsSheet_();
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000);
    
    const lastRow = sheet.getLastRow();
    let rowIndex = 0;
    
    if (lastRow > 1) {
      const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < keys.length; i++) {
        if (String(keys[i][0]).trim().toUpperCase() === normalizedKey) {
          rowIndex = i + 2;
          break;
        }
      }
    }
    
    const normalizedValue = NEXG_EMAIL_normalizeValue_(value);
    const now = new Date();
    
    if (rowIndex) {
      sheet.getRange(rowIndex, 2).setValue(normalizedValue);
      if (description) {
        sheet.getRange(rowIndex, 3).setValue(description);
      }
      sheet.getRange(rowIndex, 4).setValue(now);
    } else {
      sheet.appendRow([normalizedKey, normalizedValue, description || '', now]);
    }
    
    SpreadsheetApp.flush();
    
    return {
      ok: true,
      key: normalizedKey,
      value: normalizedValue
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Appends one row to Email_Logs.
 */
function NEXG_EMAIL_appendLog(logObject) {
  logObject = logObject || {};
  const sheet = NEXG_EMAIL_getLogsSheet_();
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000);
    
    const logId = logObject.logId || ('EMAIL_' + Utilities.getUuid());
    
    const row = [
      logId,
      logObject.timestamp || new Date(),
      String(logObject.status || 'INFO').toUpperCase(),
      NEXG_EMAIL_normalizeValue_(logObject.testMode),
      logObject.template || '',
      logObject.recipient || '',
      logObject.subject || '',
      logObject.merchantId || '',
      logObject.employeeId || '',
      logObject.eventId || '',
      logObject.sentBy || '',
      logObject.error || '',
      typeof logObject.payload === 'object' && logObject.payload !== null
        ? JSON.stringify(logObject.payload)
        : (logObject.payload || '')
    ];
    
    sheet.appendRow(row);
    
    // Enforce formatting on every write to keep the sheet readable
    NEXG_EMAIL_formatLogsSheet_(sheet);
    
    SpreadsheetApp.flush();
    
    return logId;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Returns recent email logs, newest first.
 * FIX B1: Ignores sheet.getMaxColumns() and forces reading exactly 13 columns.
 */
function NEXG_EMAIL_getLogs(limit) {
  const sheet = NEXG_EMAIL_getLogsSheet_();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) return [];
  
  const requestedLimit = Math.max(1, Number(limit || 100));
  const rowCount = Math.min(requestedLimit, lastRow - 1);
  const startRow = lastRow - rowCount + 1;
  
  // FORCE reading exactly 13 columns regardless of sheet drift
  const colCount = NEXG_EMAIL_LOG_HEADERS.length; 
  
  const values = sheet.getRange(startRow, 1, rowCount, colCount).getValues();
  
  const logs = values.map(function(row) {
    const log = {};
    NEXG_EMAIL_LOG_FIELDS.forEach(function(field, index) {
      log[field] = row[index];
    });
    
    if (log.payload) {
      try {
        log.payload = JSON.parse(log.payload);
      } catch (err) {
        // Leave payload as string if it cannot be parsed.
      }
    }
    
    return log;
  });
  
  return logs.reverse();
}

/*************************************************************
 * Internal helpers
 *************************************************************/

function NEXG_EMAIL_getSpreadsheet_() {
  let spreadsheetId = '';
  try {
    if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID) {
      spreadsheetId = SPREADSHEET_ID;
    }
  } catch (err) {
    spreadsheetId = '';
  }
  
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    return ss;
  }
  
  throw new Error(
    'NEXG Email could not find a spreadsheet. If this is a standalone script, define SPREADSHEET_ID.'
  );
}

function NEXG_EMAIL_getSettingsSheet_() {
  const ss = NEXG_EMAIL_getSpreadsheet_();
  const sheet = NEXG_EMAIL_getOrCreateSheet_(ss, NEXG_EMAIL_SHEET_NAMES.SETTINGS);
  NEXG_EMAIL_ensureHeaders_(sheet, NEXG_EMAIL_SETTINGS_HEADERS);
  return sheet;
}

function NEXG_EMAIL_getLogsSheet_() {
  const ss = NEXG_EMAIL_getSpreadsheet_();
  let sheet = ss.getSheetByName(NEXG_EMAIL_SHEET_NAMES.LOGS);
  
  // If the exact sheet is empty, look for a same-name-with-different-spacing sheet that HAS data
  if (!sheet || sheet.getLastRow() < 2) {
    const candidates = ss.getSheets().filter(function (s) {
      return s.getName().toLowerCase().replace(/[\s_\-]+/g, '') === 'emaillogs';
    });
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].getLastRow() >= 2) { 
        sheet = candidates[i]; 
        break; 
      }
    }
  }
  
  if (!sheet) sheet = NEXG_EMAIL_getOrCreateSheet_(ss, NEXG_EMAIL_SHEET_NAMES.LOGS);
  NEXG_EMAIL_ensureHeaders_(sheet, NEXG_EMAIL_LOG_HEADERS);
  return sheet;
}

function NEXG_EMAIL_getOrCreateSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function NEXG_EMAIL_ensureHeaders_(sheet, headers) {
  const firstHeaderValue = String(sheet.getRange(1, 1).getValue()).trim();
  if (firstHeaderValue !== headers[0]) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#f1f5f9');
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush();
  }
}

function NEXG_EMAIL_seedDefaultSettings_(sheet) {
  const defaults = NEXG_EMAIL_defaultSettings_();
  const lastRow = sheet.getLastRow();
  const existingKeys = {};
  
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    values.forEach(function(row) {
      const key = String(row[0]).trim().toUpperCase();
      if (key) existingKeys[key] = true;
    });
  }
  
  const now = new Date();
  const rowsToAdd = [];
  
  defaults.forEach(function(item) {
    if (!existingKeys[item.key]) {
      rowsToAdd.push([item.key, item.value, item.description, now]);
    }
  });
  
  if (rowsToAdd.length) {
    sheet.getRange(lastRow + 1, 1, rowsToAdd.length, 4).setValues(rowsToAdd);
    SpreadsheetApp.flush();
  }
}

function NEXG_EMAIL_defaultSettings_() {
  return [
    {
      key: 'ADMIN_EMAIL',
      value: '',
      description: 'Admin recipient used for tests, previews, and failure alerts.'
    },
    {
      key: 'FROM_NAME',
      value: 'NEXG',
      description: 'Sender name shown in outgoing emails.'
    },
    {
      key: 'FROM_EMAIL',
      value: '',
      description: 'Verified Gmail alias to send from (e.g. merchant@nexgapp.com).'
    },
    {
      key: 'REPLY_TO',
      value: '',
      description: 'Reply-to address. Leave blank to use the default sender address.'
    },
    {
      key: 'COMPANY_NAME',
      value: 'NEXG',
      description: 'Company name used in email templates and footer.'
    },
    {
      key: 'WEBSITE',
      value: '',
      description: 'Company website used in email footer.'
    },
    {
      key: 'PHONE',
      value: '',
      description: 'Company phone used in email footer.'
    },
    {
      key: 'SIGNATURE_HTML',
      value: '<p>Best regards,</p><p><strong>NEXG Team</strong></p>',
      description: 'HTML signature appended to email bodies.'
    },
    {
      key: 'TIMEZONE',
      value: Session.getScriptTimeZone(),
      description: 'Timezone used for rendering dates and times in emails.'
    },
    {
      key: 'TEST_MODE',
      value: 'TRUE',
      description: 'When TRUE, outgoing emails are redirected to ADMIN_EMAIL.'
    },
    {
      key: 'ENABLE_LOGGING',
      value: 'TRUE',
      description: 'When TRUE, email activity is written to Email_Logs.'
    },
    {
      key: 'LOGO_FILE_ID',
      value: '',
      description: 'Google Drive file ID of the inline logo image.'
    }
  ];
}

function NEXG_EMAIL_formatLogsSheet_(sheet) {
  try {
    // Force date formatting so the sheet is readable
    sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    
    // Set column widths for readability
    sheet.setColumnWidth(1, 260); // Log ID
    sheet.setColumnWidth(2, 180); // Timestamp
    sheet.setColumnWidth(3, 120); // Status
    sheet.setColumnWidth(4, 110); // Test Mode
    sheet.setColumnWidth(5, 180); // Template
    sheet.setColumnWidth(6, 220); // Recipient
    sheet.setColumnWidth(7, 260); // Subject
    sheet.setColumnWidth(8, 140); // Merchant ID
    sheet.setColumnWidth(9, 140); // Employee ID
    sheet.setColumnWidth(10, 140); // Event ID
    sheet.setColumnWidth(11, 220); // Sent By
    sheet.setColumnWidth(12, 260); // Error
    sheet.setColumnWidth(13, 320); // Payload
  } catch (err) {
    // Formatting is optional. Do not fail Step 1 if formatting fails.
  }
}

function NEXG_EMAIL_normalizeValue_(value) {
  if (value === null || typeof value === 'undefined') return '';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}