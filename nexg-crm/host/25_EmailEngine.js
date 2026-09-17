/**
 * NEXG CRM
 * Contract 4 — Email Engine (queue + sender + logger)
 * File: 25_EmailEngine.gs
 *
 * Purpose:
 * - Sheet-backed outbound queue (Email_Queue): enqueue is instant, the UI never blocks.
 * - processQueue() runs on a 5-minute time trigger: 25 sends/run, 3 attempts, then Failed.
 * - Every send writes/updates an EmailLogs record (the single communication truth).
 * - Test mode (Settings category 'email': testMode=true) redirects all sends to
 *   testRecipient unless metadata.sendMode === 'live'. Consumer Gmail quota (~100/day)
 *   is respected by the small batch size; check MailApp.getRemainingDailyQuota in logs.
 *
 * NOTE: internal EmailLogs bookkeeping writes run via runAsSystem. The caller is
 * already authorized by 'email.send'; roles only grant email.view/send/edit (no
 * email.create), so the log write must not require a separate grant. The permission
 * matrix itself is revisited in the security pass.
 */

var NEXG = NEXG || {};

NEXG.EmailEngine = {

  QUEUE_SHEET: 'Email_Queue',

  QUEUE_HEADERS: [
    'queueId', 'status', 'scheduledAt', 'templateId', 'recipient', 'hostId',
    'subject', 'body', 'dataJson', 'metadataJson', 'attempts', 'error', 'createdAt'
  ],

  MAX_PER_RUN: 25,
  MAX_ATTEMPTS: 3,
  HANDLER: 'NEXG_processEmailQueue',

  /* ---------------- validation ---------------- */

  isEmail_: function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  },

  /* ---------------- settings (test mode) ---------------- */

  getEmailSetting_: function(key, fallback) {
    try {
      var rec = NEXG.Migrations.findSettingRecord('email', key);
      if (!rec) return fallback;
      var v = rec.valueJson;
      if (v && typeof v === 'object' && ('value' in v)) return v.value;
      return (v === undefined || v === null) ? fallback : v;
    } catch {
      return fallback;
    }
  },

  isTestMode_: function() {
    return NEXG.Utilities.isActive(NEXG.EmailEngine.getEmailSetting_('testMode', false));
  },

  getTestRecipient_: function() {
    var r = String(NEXG.EmailEngine.getEmailSetting_('testRecipient', '') || '').trim();
    if (r) return r;
    try {
      var admin = PropertiesService.getScriptProperties()
        .getProperty(NEXG.Config.scriptPropertyKeys.adminEmail);
      return String(admin || '').trim();
    } catch {
      return '';
    }
  },

  /**
   * Resolves the real recipient. Test mode redirects everything to testRecipient
   * unless the caller explicitly passes metadata.sendMode === 'live'.
   */
  resolveRecipient_: function(recipient, metadata) {
    metadata = metadata || {};
    if (NEXG.EmailEngine.isTestMode_() && metadata.sendMode !== 'live') {
      var testTo = NEXG.EmailEngine.getTestRecipient_();
      if (!testTo) {
        NEXG.throwError('EMAIL_CONFIG',
          'Test mode is ON but no test recipient is set (Settings email.testRecipient).');
      }
      return { to: testTo, intended: recipient, redirected: true };
    }
    return { to: recipient, intended: recipient, redirected: false };
  },

  /* ---------------- queue sheet ---------------- */

  ensureQueueSheet: function() {
    var sheet = NEXG.Sheets.ensureSheet(NEXG.EmailEngine.QUEUE_SHEET);
    var changed = NEXG.Sheets.ensureHeaders(sheet, NEXG.EmailEngine.QUEUE_HEADERS);
    if (changed) NEXG.Sheets.formatSheet(sheet);
    return sheet;
  },

  /* ---------------- enqueue ---------------- */

  enqueue: function(payload) {
    NEXG.Security.requirePermission('email.send');
    payload = payload || {};

    var recipient = String(payload.recipient || '').trim();
    if (!NEXG.EmailEngine.isEmail_(recipient)) {
      NEXG.throwError('VALIDATION_ERROR', 'Valid recipient email is required.');
    }

    var now = new Date();
    var data = payload.data || {};
    var metadata = payload.metadata || {};
    var templateId = String(payload.templateId || '').trim();
    var subject = String(payload.subject || '');
    var body = String(payload.body || '');
    var preview = body.slice(0, 200);

    // Template path: subject/body render at send time; pre-render now so a
    // bad template key or missing data fails fast with a clear error.
    if (templateId) {
      var pre = NEXG.EmailTemplates.render(templateId, data);
      if (!subject) subject = pre.subject;
      preview = pre.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    }
    if (!subject) NEXG.throwError('VALIDATION_ERROR', 'Subject or templateId is required.');

    var queueId = NEXG.IdGenerator.nextId('EMQ');

    var logRef = NEXG.Security.runAsSystem(function() {
      return NEXG.Workflows._emails().create({
        hostId: payload.hostId || '',
        templateId: templateId,
        recipient: recipient,
        subject: subject,
        bodyPreview: preview,
        status: 'Queued',
        queuedAt: now
      });
    });

    var row = {
      queueId: queueId,
      status: 'Pending',
      scheduledAt: payload.sendAt ? new Date(payload.sendAt) : now,
      templateId: payload.templateId || '',
      recipient: recipient,
      hostId: payload.hostId || '',
      subject: payload.subject,
      body: payload.body || '',
      dataJson: JSON.stringify(data),
      metadataJson: JSON.stringify(metadata),
      attempts: 0,
      error: '',
      createdAt: now
    };
    // Correlate queue row <-> EmailLogs record.
    metadata.emailLogId = logRef.data.record.emailLogId;
    metadata.queueId = queueId;
    row.metadataJson = JSON.stringify(metadata);

    var sheet = NEXG.EmailEngine.ensureQueueSheet();
    NEXG.Utilities.withLock(function() { NEXG.Sheets.appendRecord(sheet, row); });

    return NEXG.ok({ queueId: queueId, emailLogId: logRef.data.record.emailLogId, status: 'Queued' });
  },

  /* ---------------- sender ---------------- */

  sendNow_: function(to, subject, body) {
    body = String(body || '');
    // HTML template output goes as htmlBody (with a plain-text fallback);
    // free-typed panel messages stay plain text so line breaks survive.
    if (/<[a-z][\s>]/.test(body)) {
      var plain = body.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/[ \t]+\n/g, '\n').trim();
      GmailApp.sendEmail(to, subject, plain, { htmlBody: body });
    } else {
      GmailApp.sendEmail(to, subject, body);
    }
    return { sent: true, to: to };
  },

  updateLog_: function(emailLogId, updates) {
    if (!emailLogId) return;
    NEXG.Security.runAsSystem(function() {
      NEXG.Workflows._emails().update(emailLogId, updates);
    });
  },

  /* ---------------- processor (trigger entry) ---------------- */

  processQueue: function(options) {
    options = options || {};
    var maxPerRun = options.maxPerRun || NEXG.EmailEngine.MAX_PER_RUN;
    var maxAttempts = options.maxAttempts || NEXG.EmailEngine.MAX_ATTEMPTS;

    var sheet = NEXG.EmailEngine.ensureQueueSheet();
    var headerMap = NEXG.Sheets.getHeaderMap(sheet);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return NEXG.ok({ processed: 0, sent: 0, failed: 0 });

    var lastCol = sheet.getLastColumn();
    var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var now = new Date();
    var processed = 0, sent = 0, failed = 0;

    function col(name) { return headerMap[name]; }
    function setCell(row, name, value) {
      if (col(name)) sheet.getRange(row, col(name)).setValue(value);
    }

    for (var i = 0; i < values.length && processed < maxPerRun; i++) {
      var rowValues = values[i];
      function val(name) { return col(name) ? rowValues[col(name) - 1] : ''; }

      if (String(val('status')) !== 'Pending') continue;
      var scheduled = val('scheduledAt') ? new Date(val('scheduledAt')) : now;
      if (scheduled > now) continue; // scheduled for later

      var rowIndex = i + 2;
      var attempts = Number(val('attempts')) + 1 || 1;
      var metadata = NEXG.Utilities.parseJson(val('metadataJson'), {});
      if (typeof metadata !== 'object' || !metadata) metadata = {};
      var tdata = NEXG.Utilities.parseJson(val('dataJson'), {});
      if (typeof tdata !== 'object' || !tdata) tdata = {};
      processed++;

      try {
        // Template path resolves at send time from stored merge data.
        var subject = String(val('subject'));
        var body = String(val('body'));
        var tplKey = String(val('templateId') || '');
        if (tplKey) {
          var rendered = NEXG.EmailTemplates.render(tplKey, tdata);
          subject = rendered.subject;
          body = rendered.body;
        }
        var resolved = NEXG.EmailEngine.resolveRecipient_(String(val('recipient')), metadata);
        NEXG.EmailEngine.sendNow_(resolved.to, subject, body);

        setCell(rowIndex, 'attempts', attempts);
        setCell(rowIndex, 'error', '');
        setCell(rowIndex, 'status', 'Sent');

        var sentUpdates = { status: 'Sent', sentAt: new Date(), subject: subject };
        if (resolved.redirected) sentUpdates.recipient = resolved.to;
        NEXG.EmailEngine.updateLog_(metadata.emailLogId, sentUpdates);

        NEXG.Security.runAsSystem(function() {
          NEXG.Workflows._log('email.sent', String(val('hostId')),
            'Email sent: ' + String(val('subject')), '',
            { metadataJson: { emailLogId: metadata.emailLogId, queueId: String(val('queueId')) } });
        });
        NEXG.EventBus.publish('workflow.emailSent', {
          hostId: String(val('hostId')),
          emailLogId: metadata.emailLogId,
          queueId: String(val('queueId'))
        });
        sent++;
      } catch (err) {
        var message = String((err && err.message) || err).slice(0, 500);
        var terminal = attempts >= maxAttempts;
        setCell(rowIndex, 'attempts', attempts);
        setCell(rowIndex, 'error', message);
        setCell(rowIndex, 'status', terminal ? 'Failed' : 'Pending');

        NEXG.EmailEngine.updateLog_(metadata.emailLogId, terminal
          ? { status: 'Failed', failedAt: new Date(), failureReason: message }
          : { failureReason: message });
        if (terminal) failed++;
      }
    }

    return NEXG.ok({ processed: processed, sent: sent, failed: failed });
  },

  /* ---------------- stats (for Email Center) ---------------- */

  getQueueStats: function() {
    NEXG.Security.requirePermission('email.view');
    var sheet = NEXG.EmailEngine.ensureQueueSheet();
    var records = NEXG.Sheets.getRecords(sheet, {});
    var stats = { Pending: 0, Sent: 0, Failed: 0, total: records.length };
    records.forEach(function(r) {
      var s = String(r.status || '');
      if (stats[s] !== undefined && s !== 'total') stats[s]++;
    });
    try {
      stats.quotaLeft = MailApp.getRemainingDailyQuota();
    } catch {
      stats.quotaLeft = null;
    }
    return NEXG.ok(stats);
  },

  /* ---------------- trigger install ---------------- */

  ensureQueueTrigger: function() {
    var handler = NEXG.EmailEngine.HANDLER;
    ScriptApp.getProjectTriggers().forEach(function(t) {
      if (t.getHandlerFunction() === handler) ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger(handler).timeBased().everyMinutes(5).create();
    return 'Installed: ' + handler + ' every 5 minutes.';
  }
};

/** Time-driven trigger entry point (runs as the installer identity). */
function NEXG_processEmailQueue() {
  return NEXG.EmailEngine.processQueue();
}

/** Run ONCE from the editor to install the 5-minute queue trigger. */
function NEXG_installEmailQueueTrigger() {
  return NEXG.EmailEngine.ensureQueueTrigger();
}

/**
 * One-click end-to-end test: enqueues an email to the configured test recipient
 * (Settings email.testRecipient, else NEXG_ADMIN_EMAIL script property) and
 * processes it immediately. Run from the editor while logged in as admin.
 */
function NEXG_sendTestEmail() {
  NEXG.Security.requirePermission('email.send');
  var to = NEXG.EmailEngine.getTestRecipient_();
  if (!NEXG.EmailEngine.isEmail_(to)) {
    NEXG.throwError('EMAIL_CONFIG',
      'Set a test recipient first: Settings category=email key=testRecipient, or NEXG_ADMIN_EMAIL script property.');
  }
  var queued = NEXG.EmailEngine.enqueue({
    templateId: 'TEST',
    recipient: to,
    hostId: '',
    subject: 'NEXG host CRM — email engine test',
    body: 'This is a test send from the NEXG host CRM email engine. Time: '
      + NEXG.Utilities.nowIso(),
    metadata: { sendMode: 'live', source: 'engine.test' }
  });
  var result = NEXG.EmailEngine.processQueue({ maxPerRun: 1 });
  return NEXG.ok({ queued: queued.data, processed: result.data });
}
