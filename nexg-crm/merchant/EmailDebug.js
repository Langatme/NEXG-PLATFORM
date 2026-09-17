const NEXG_DEBUG_EMAIL = 'PUT_YOUR_REAL_EMAIL_HERE';

/**
 * 1. Prove MailApp itself works
 */
function nexg01_plainMailTest() {
  const to = NEXG_DEBUG_EMAIL;

  if (!to || to.indexOf('PUT_YOUR_REAL_EMAIL_HERE') !== -1) {
    throw new Error('Set NEXG_DEBUG_EMAIL first.');
  }

  const quota = MailApp.getRemainingDailyQuota();
  MailApp.sendEmail(
    to,
    'NEXG plain mail test',
    'If you receive this, Apps Script MailApp works.'
  );

  Logger.log('Plain email sent.');
  Logger.log('Remaining daily quota: ' + quota);
}

/**
 * 2. Force basic email settings
 */
function nexg02_forceBasicSettings() {
  const email = NEXG_DEBUG_EMAIL;

  if (!email || email.indexOf('PUT_YOUR_REAL_EMAIL_HERE') !== -1) {
    throw new Error('Set NEXG_DEBUG_EMAIL first.');
  }

  if (typeof EmailConfig === 'undefined') {
    throw new Error('EmailConfig is not loaded. Your email .gs files may be missing or broken.');
  }

  EmailConfig.init();
  EmailConfig.set('ADMIN_EMAIL', email, 'Debug admin recipient');
  EmailConfig.set('TEST_MODE', true, 'Force test mode');
  EmailConfig.set('ENABLE_LOGGING', true, 'Force logging');

  const validation = EmailConfig.validate();
  Logger.log(JSON.stringify(validation, null, 2));
  return validation;
}

/**
 * 3. Force admin access for the control center
 */
function nexg03_forceAdminAccess() {
  const email = NEXG_DEBUG_EMAIL;

  if (!email || email.indexOf('PUT_YOUR_REAL_EMAIL_HERE') !== -1) {
    throw new Error('Set NEXG_DEBUG_EMAIL first.');
  }

  if (typeof NEXG_EMAIL_initializeEmailSheets === 'undefined') {
    throw new Error('Email data layer is not loaded.');
  }

  NEXG_EMAIL_initializeEmailSheets();
  NEXG_EMAIL_setSetting('ADMIN_USERS', email, 'Allowed control center admins');
  NEXG_EMAIL_setSetting('ADMIN_EMAIL', email, 'Test mode recipient');
  NEXG_EMAIL_setSetting('TEST_MODE', true, 'Redirect sends to admin');
  NEXG_EMAIL_setSetting('ENABLE_LOGGING', true, 'Write email logs');

  Logger.log('ADMIN_USERS set to: ' + NEXG_EMAIL_getSetting('ADMIN_USERS'));
  Logger.log('ADMIN_EMAIL set to: ' + NEXG_EMAIL_getSetting('ADMIN_EMAIL'));
}

/**
 * 4. Test template rendering only
 */
function nexg04_templateRenderOnly() {
  if (typeof EmailTemplates === 'undefined') {
    throw new Error('EmailTemplates is not loaded.');
  }

  const keys = EmailTemplates.list();

  const preview = Email.preview('GENERAL', {
    email_subject: 'NEXG render test',
    contact_person: 'Debug Person',
    business_name: 'Debug Business',
    message_body: 'This is a render-only test.',
    sales_rep: 'Debug Rep'
  });

  const out = {
    templateCount: keys.length,
    templates: keys,
    subject: preview.subject,
    htmlLength: preview.html.length
  };

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * 5. Test full template send pipeline
 */
function nexg05_templateSendTest() {
  const to = NEXG_DEBUG_EMAIL;

  if (!to || to.indexOf('PUT_YOUR_REAL_EMAIL_HERE') !== -1) {
    throw new Error('Set NEXG_DEBUG_EMAIL first.');
  }

  if (typeof Email === 'undefined') {
    throw new Error('Email is not loaded.');
  }

  const result = Email.send(
    'GENERAL',
    to,
    {
      email_subject: 'NEXG template send test',
      contact_person: 'Debug Person',
      business_name: 'Debug Business',
      message_body: 'This is a full pipeline test.',
      sales_rep: 'Debug Rep'
    },
    {
      merchantId: 'DEBUG-MERCHANT',
      employeeId: 'DEBUG-EMPLOYEE',
      eventId: 'DEBUG-EVENT'
    }
  );

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * 6. UI / session / admin diagnostic
 */
function nexg06_uiAccessTest() {
  const out = {};

  try {
    out.activeUser = Session.getActiveUser().getEmail();
  } catch (e) {
    out.activeUserError = e.message;
  }

  try {
    out.effectiveUser = Session.getEffectiveUser().getEmail();
  } catch (e) {
    out.effectiveUserError = e.message;
  }

  try {
    out.adminUsersSetting = NEXG_EMAIL_getSetting('ADMIN_USERS');
    out.adminEmailSetting = NEXG_EMAIL_getSetting('ADMIN_EMAIL');
  } catch (e) {
    out.settingsError = e.message;
  }

  try {
    out.adminList = EmailAdmin.getAdminUsers();
  } catch (e) {
    out.adminListError = e.message;
  }

  try {
    out.isAuthorized = EmailAdmin.isAuthorized(out.activeUser || '');
  } catch (e) {
    out.isAuthorizedError = e.message;
  }

  try {
    out.cardData = EmailAdmin.cardData();
  } catch (e) {
    out.cardDataError = e.message;
  }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * 7. Full diagnostic in one shot
 */
function nexg07_fullDiag() {
  const out = {
    debugEmail: NEXG_DEBUG_EMAIL
  };

  try {
    out.mailQuota = MailApp.getRemainingDailyQuota();
  } catch (e) {
    out.mailQuotaError = e.message;
  }

  try {
    out.activeUser = Session.getActiveUser().getEmail();
  } catch (e) {
    out.activeUserError = e.message;
  }

  try {
    out.effectiveUser = Session.getEffectiveUser().getEmail();
  } catch (e) {
    out.effectiveUserError = e.message;
  }

  try {
    out.templatesLoaded = typeof EmailTemplates !== 'undefined';
    if (out.templatesLoaded) {
      out.templateList = EmailTemplates.list();
      out.templateCount = out.templateList.length;
    }
  } catch (e) {
    out.templatesError = e.message;
  }

  try {
    out.configLoaded = typeof EmailConfig !== 'undefined';
    if (out.configLoaded) {
      out.settings = EmailConfig.all();
      out.validation = EmailConfig.validate();
    }
  } catch (e) {
    out.configError = e.message;
  }

  try {
    out.adminUsersSetting = NEXG_EMAIL_getSetting('ADMIN_USERS');
    out.adminEmailSetting = NEXG_EMAIL_getSetting('ADMIN_EMAIL');
  } catch (e) {
    out.settingsSheetError = e.message;
  }

  try {
    const preview = Email.preview('GENERAL', {
      email_subject: 'Diagnostic preview',
      contact_person: 'Diagnostic',
      business_name: 'Diagnostic Business',
      message_body: 'Diagnostic render test.',
      sales_rep: 'Diagnostic Rep'
    });

    out.previewSubject = preview.subject;
    out.previewHtmlLength = preview.html.length;
  } catch (e) {
    out.previewError = e.message;
  }

  if (NEXG_DEBUG_EMAIL && NEXG_DEBUG_EMAIL.indexOf('PUT_YOUR_REAL_EMAIL_HERE') === -1) {
    try {
      out.sendResult = Email.send(
        'GENERAL',
        NEXG_DEBUG_EMAIL,
        {
          email_subject: 'Diagnostic send test',
          contact_person: 'Diagnostic',
          business_name: 'Diagnostic Business',
          message_body: 'Diagnostic send test.',
          sales_rep: 'Diagnostic Rep'
        },
        {
          merchantId: 'DIAG',
          employeeId: 'DIAG',
          eventId: 'DIAG'
        }
      );
    } catch (e) {
      out.sendError = e.message;
    }
  } else {
    out.sendSkipped = 'Set NEXG_DEBUG_EMAIL first';
  }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function testAliasEmail() {

  Logger.log(GmailApp.getAliases());

  GmailApp.sendEmail(
    "YOURPERSONALEMAIL@gmail.com",
    "Alias Test",
    "This should come from merchant@nexgapp.com",
    {
      from: "merchant@nexgapp.com",
      name: "NEXG Merchants"
    }
  );

}

function checkAliases() {
  Logger.log(GmailApp.getAliases());
}
function debugEmailIdentityAndLogo() {
  EmailConfig.init();

  const cfg = EmailConfig.all();

  let active = '';
  let effective = '';
  let aliases = [];

  try {
    active = Session.getActiveUser().getEmail();
  } catch (e) {
    active = 'ERROR: ' + e.message;
  }

  try {
    effective = Session.getEffectiveUser().getEmail();
  } catch (e) {
    effective = 'ERROR: ' + e.message;
  }

  try {
    aliases = GmailApp.getAliases();
  } catch (e) {
    aliases = ['ERROR: ' + e.message];
  }

  const fileId = cfg.LOGO_FILE_ID || '';

  let logo = {
    fileId: fileId
  };

  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();

    logo.access = 'OK';
    logo.name = file.getName();
    logo.mimeType = file.getMimeType();
    logo.bytes = blob.getBytes().length;
  } catch (e) {
    logo.access = 'FAILED';
    logo.error = e.message;
  }

  return {
    activeUser: active,
    effectiveUser: effective,
    aliases: aliases,
    configuredFromEmail: cfg.FROM_EMAIL || '',
    adminEmail: cfg.ADMIN_EMAIL || '',
    logo: logo
  };
}

function debugLogoBlob() {
  var fileId = String(EmailConfig.get('LOGO_FILE_ID') || '').trim();
  if (!fileId) return "No LOGO_FILE_ID set in Email_Settings.";
  
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  
  return {
    fileName: blob.getName(),
    fileSizeBytes: blob.getBytes().length,
    currentContentType: blob.getContentType(), // <-- THIS IS THE CULPRIT IF IT'S NOT image/png
    driveMimeType: file.getMimeType(),
    isShortcut: file.getMimeType() === MimeType.SHORTCUT ? "YES (This breaks inline images)" : "No"
  };
}

function verifyEmailCenterPipeline() {
  const sheet = NEXG_EMAIL_getLogsSheet_();
  return {
    sheetBeingRead: sheet.getName(),
    lastRow: sheet.getLastRow(),
    maxColumns: sheet.getMaxColumns(),
    sample: NEXG_EMAIL_getLogs(3),
    ccLogsRowCount: (function () { try { return Email.logs(10).length; } catch (e) { return 'ERROR: ' + e.message; } })()
  };
}

function necCenterDiag() {
  const out = {};
  try { out.activeUser = Session.getActiveUser().getEmail(); } catch (e) { out.activeUser = 'ERR: ' + e.message; }
  try { out.admins = EmailAdmin.getAdminUsers(); } catch (e) { out.adminsErr = e.message; }
  try { out.sheetLogs = NEXG_EMAIL_getLogs(5).length; } catch (e) { out.sheetLogsErr = e.message; }
  try { out.directLogs = necReadLogsDirect_(5).length; } catch (e) { out.directLogsErr = e.message; }
  try { out.templates = EmailTemplates.all().length; } catch (e) { out.templatesErr = e.message; }
  try { out.config = !!EmailConfig.all(); } catch (e) { out.configErr = e.message; }
  try { out.bootstrap = Email.bootstrap(); out.bootstrapOk = true; }
  catch (e) { out.bootstrapErr = e.message + '  @  ' + ((e.stack || '').split('\n')[1] || '').trim(); }
  try { out.ccLogs = ccLogs(5, 'ALL').length; } catch (e) { out.ccLogsErr = e.message; }
  return out;
}
function necCenterProbe() {
  const out = {};
  try { out.user = EmailAdmin.assertAccess(); } catch (e) { out.accessError = e.message; }
  try { out.configOk = !!EmailConfig.all(); } catch (e) { out.configError = e.message; }
  try { out.logRows = NEXG_EMAIL_getLogs(5).length; } catch (e) { out.logsError = e.message; }
  try { out.bootstrapStats = Email.bootstrap().stats; }
  catch (e) { out.bootstrapError = e.message + '  @  ' + ((e.stack || '').split('\n')[1] || '').trim(); }
  try { out.ccLogsRows = ccLogs(5, 'ALL').length; } catch (e) { out.ccLogsError = e.message; }
  return out;
}

function nexg08_centerDataTest() {
  var out = {};

  // 1) The admin gate (ccBootstrap/ccLogs run this FIRST)
  try {
    out.activeUser = EmailAdmin.getCurrentUserEmail();
    try { EmailAdmin.assertAccess(); out.gate = 'PASS'; }
    catch (e) { out.gate = 'FAIL: ' + e.message; }
  } catch (e) { out.gateError = e.message; }

  // 2) Email.bootstrap() = exactly what ccBootstrap sends to the Center
  try {
    var boot = Email.bootstrap();
    out.bootstrapOk = boot.ok;
    out.stats = boot.stats;
    out.configTestMode = boot.config ? boot.config.testMode : 'n/a';
    out.recentLogsCount = (boot.recentLogs || []).length;
  } catch (e) { out.bootstrapError = e.message; }

  // 3) Email.logs() = exactly what ccLogs sends to the Activity tab
  try {
    var logs = Email.logs(60, 'ALL');
    out.logsCount = logs.length;
    out.firstLog = logs[0] ? (logs[0].template + ' / ' + logs[0].status) : null;
  } catch (e) { out.logsError = e.message; }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function debugEmailLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets().map(s => s.getName());
  let targetSheet = ss.getSheetByName('Email_Logs');
  let lastRow = targetSheet ? targetSheet.getLastRow() : 0;
  let logs = [];
  try { logs = NEXG_EMAIL_getLogs(5); } catch (e) { logs = 'ERROR: ' + e.message; }
  return {
    allSheetsInFile: allSheets,            // ← shows the exact spelling of every tab
    exactMatch_Found: allSheets.includes('Email_Logs'),
    targetSheetLastRow: lastRow,           // ← rows in the exact 'Email_Logs' tab
    dataReturnedToUI: logs                 // ← what actually reaches the dashboard
  };
}

function runDebugEmailLogs() {
  const result = debugEmailLogs();
  Logger.log(JSON.stringify(result, null, 2));
}

function nexg09_centerLogsDiag() {
  var out = {};

  // 1. Is EmailLogger the NEW version (with getLogs/getStats)?
  out.emailLogger_defined = (typeof EmailLogger !== 'undefined');
  if (out.emailLogger_defined) {
    out.logger_has_getLogs  = (typeof EmailLogger.getLogs  === 'function');
    out.logger_has_getStats = (typeof EmailLogger.getStats === 'function');
  }

  // 2. Direct sheet read (what debugEmailLogs already proved works)
  try { var d = NEXG_EMAIL_getLogs(5);
        out.direct_count = d.length;
        out.direct_firstKeys = d.length ? Object.keys(d[0]).join(',') : 'none';
  } catch (e) { out.direct_error = e.message; }

  // 3. Through EmailLogger
  try { out.logger_count = EmailLogger.getLogs(5).length; }
  catch (e) { out.logger_error = e.message; }

  // 4. Through Email.logs
  try { out.emailLogs_count = Email.logs(5, 'ALL').length; }
  catch (e) { out.emailLogs_error = e.message; }

  // 5. Through ccLogs (the EXACT function the Activity Log calls)
  try { out.ccLogs_count = ccLogs(5, 'ALL').length; }
  catch (e) { out.ccLogs_error = e.message; }

  // 6. Through bootstrap (the EXACT function the Overview calls)
  try { var b = Email.bootstrap();
        out.bootstrap_ok = b.ok;
        out.bootstrap_recentLogs = b.recentLogs ? b.recentLogs.length : 0;
        out.bootstrap_stats_sent = b.stats ? b.stats.sent : 'n/a';
  } catch (e) { out.bootstrap_error = e.message; }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * ONE-SHOT EMAIL CENTER PIPELINE DIAGNOSTIC
 * Tests every stage from sheet → logger → API → bootstrap → client contract.
 * Returns a single report showing exactly where data disappears.
 */
function diagnoseEmailCenterPipeline() {
  var report = { stages: [], summary: '' };
  var failStage = null;

  function pass(name, details) {
    report.stages.push({ stage: name, status: 'PASS', details: details });
  }
  function fail(name, reason, details) {
    if (!failStage) failStage = name;
    report.stages.push({ stage: name, status: 'FAIL', reason: reason, details: details || {} });
  }

  // ── STAGE 1: Direct Sheet Read ────────────────────────────────
  try {
    var directLogs = NEXG_EMAIL_getLogs(5);
    if (Array.isArray(directLogs) && directLogs.length > 0) {
      pass('Sheet (NEXG_EMAIL_getLogs)', {
        count: directLogs.length,
        firstKeys: Object.keys(directLogs[0]).join(', '),
        firstTemplate: directLogs[0].template,
        firstStatus: directLogs[0].status
      });
    } else {
      fail('Sheet (NEXG_EMAIL_getLogs)', 'Returned empty array or non-array', {
        type: typeof directLogs,
        isArray: Array.isArray(directLogs),
        value: JSON.stringify(directLogs).substring(0, 200)
      });
    }
  } catch (e) {
    fail('Sheet (NEXG_EMAIL_getLogs)', e.message);
  }

  // ── STAGE 2: EmailLogger.getLogs() ────────────────────────────
  try {
    var loggerLogs = EmailLogger.getLogs(5);
    if (Array.isArray(loggerLogs) && loggerLogs.length > 0) {
      pass('EmailLogger.getLogs()', {
        count: loggerLogs.length,
        firstKeys: Object.keys(loggerLogs[0]).join(', ')
      });
    } else {
      fail('EmailLogger.getLogs()', 'Returned empty array or non-array', {
        type: typeof loggerLogs,
        isArray: Array.isArray(loggerLogs)
      });
    }
  } catch (e) {
    fail('EmailLogger.getLogs()', e.message);
  }

  // ── STAGE 3: ccLogs() (Activity Log tab path) ────────────────
  try {
    var ccLogsResult = ccLogs(5, 'ALL');
    if (Array.isArray(ccLogsResult) && ccLogsResult.length > 0) {
      pass('ccLogs() [Activity Tab]', {
        count: ccLogsResult.length,
        firstKeys: Object.keys(ccLogsResult[0]).join(', ')
      });
    } else {
      fail('ccLogs() [Activity Tab]', 'Returned empty array or non-array', {
        type: typeof ccLogsResult,
        isArray: Array.isArray(ccLogsResult)
      });
    }
  } catch (e) {
    fail('ccLogs() [Activity Tab]', e.message);
  }

  // ── STAGE 4: Email.bootstrap() (Overview tab path) ───────────
  try {
    var boot = Email.bootstrap();
    var bootDetails = {
      ok: boot.ok,
      hasConfig: !!boot.config,
      hasStats: !!boot.stats,
      hasTemplates: Array.isArray(boot.templates),
      templateCount: Array.isArray(boot.templates) ? boot.templates.length : 0,
      hasRecentLogs: Array.isArray(boot.recentLogs),
      recentLogsCount: Array.isArray(boot.recentLogs) ? boot.recentLogs.length : 0,
      statsSent: boot.stats ? boot.stats.sent : 'n/a',
      configTestMode: boot.config ? boot.config.testMode : 'n/a'
    };

    if (boot.ok === false || boot.error) {
      fail('Email.bootstrap() [Overview Tab]', boot.error || 'ok=false', bootDetails);
    } else if (!Array.isArray(boot.recentLogs)) {
      fail('Email.bootstrap() [Overview Tab]', 'recentLogs is not an array', bootDetails);
    } else if (boot.recentLogs.length === 0 && directLogs.length > 0) {
      fail('Email.bootstrap() [Overview Tab]', 'recentLogs empty but sheet has data', bootDetails);
    } else {
      pass('Email.bootstrap() [Overview Tab]', bootDetails);
    }
  } catch (e) {
    fail('Email.bootstrap() [Overview Tab]', e.message);
  }

  // ── STAGE 5: Client Contract Validation ──────────────────────
  // Validates that the object shape matches what renderLogTable() expects
  try {
    var sampleSource = null;
    try { sampleSource = ccLogs(1, 'ALL'); } catch (e) {}
    if (!sampleSource || !sampleSource.length) {
      try { var b = Email.bootstrap(); sampleSource = b.recentLogs; } catch (e) {}
    }

    if (sampleSource && sampleSource.length > 0) {
      var log = sampleSource[0];
      var requiredFields = ['timestamp', 'template', 'recipient', 'status', 'testMode'];
      var missing = [];
      var fieldTypes = {};
      requiredFields.forEach(function (f) {
        fieldTypes[f] = typeof log[f];
        if (log[f] === undefined) missing.push(f);
      });

      if (missing.length > 0) {
        fail('Client Contract', 'Missing fields expected by renderLogTable(): ' + missing.join(', '), {
          availableFields: Object.keys(log).join(', '),
          fieldTypes: fieldTypes
        });
      } else {
        pass('Client Contract', {
          allRequiredFieldsPresent: true,
          fieldTypes: fieldTypes,
          timestampType: typeof log.timestamp,
          testModeType: typeof log.testMode
        });
      }
    } else {
      fail('Client Contract', 'No sample log available to validate shape');
    }
  } catch (e) {
    fail('Client Contract', e.message);
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  if (!failStage) {
    report.summary = 'ALL STAGES PASS — Pipeline is healthy server-side. Problem is in client-side rendering (DOM target missing, renderLogTable never called, or JS parse error preventing Center.init).';
  } else {
    report.summary = 'PIPELINE BREAKS AT: ' + failStage + '. See stage details above.';
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}