/**
 * NEXG CRM
 * Contract 5 — Email Center service (merchant-style command overview)
 * File: 32_EmailCenter.gs
 *
 * Purpose:
 * - One cached call for the panel's Email Center cards + full view:
 *   queue/test-mode stats, template catalog, recent send log.
 * - preview() renders any template with merge data (no send).
 * - sendNow() enqueues AND processes immediately for live feedback.
 * - settings()/saveSettings() expose the test-mode safety switch.
 *
 * Routes (resolved by panel namespace convention, no router edit):
 *   panel.emailCenter, panel.emailPreview
 */

var NEXG = NEXG || {};

NEXG.EmailCenter = {

  overview: function() {
    NEXG.Security.requirePermission('email.view');
    return NEXG.Cache.get('ec_overview', 60, function() {
      return NEXG.EmailCenter.buildOverview_();
    });
  },

  buildOverview_: function() {
    var emails = NEXG.getRepository('EmailLogs').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var stats = { total: emails.length, queued: 0, sent: 0, failed: 0, opened: 0, replied: 0 };
    emails.forEach(function(e) {
      if (e.status === 'Sent' || e.status === 'Delivered') stats.sent++;
      else if (e.status === 'Failed') stats.failed++;
      else if (e.status === 'Queued' || e.status === 'Sending') stats.queued++;
      if (e.openedAt) stats.opened++;
      if (e.repliedAt) stats.replied++;
    });

    var queue = { pending: 0, failed: 0, quotaLeft: null };
    try {
      var sheet = NEXG.EmailEngine.ensureQueueSheet();
      var records = NEXG.Sheets.getRecords(sheet, {});
      records.forEach(function(r) {
        if (String(r.status) === 'Pending') queue.pending++;
        if (String(r.status) === 'Failed') queue.failed++;
      });
    } catch (err) {}
    try {
      queue.quotaLeft = MailApp.getRemainingDailyQuota();
    } catch (err) {}

    return NEXG.ok({
      stats: stats,
      queue: queue,
      testMode: NEXG.EmailEngine.isTestMode_(),
      testRecipient: NEXG.EmailEngine.getTestRecipient_(),
      templateCount: NEXG.EmailTemplates.keys().length,
      templates: NEXG.EmailTemplates.list()
    });
  },

  logs: function(limit, statusFilter) {
    NEXG.Security.requirePermission('email.view');
    limit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    var emails = NEXG.getRepository('EmailLogs').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var out = emails
      .filter(function(e) { return !statusFilter || String(e.status) === String(statusFilter); })
      .sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); })
      .slice(0, limit)
      .map(function(e) {
        return {
          emailLogId: e.emailLogId, hostId: e.hostId, recipient: e.recipient,
          subject: e.subject, status: e.status, templateId: e.templateId || '',
          createdAt: e.createdAt || '', sentAt: e.sentAt || '',
          failureReason: e.failureReason || ''
        };
      });
    return NEXG.ok({ logs: out, total: emails.length });
  },

  preview: function(templateKey, data) {
    NEXG.Security.requirePermission('email.view');
    var rendered = NEXG.EmailTemplates.render(templateKey, data || {});
    return NEXG.ok({ subject: rendered.subject, body: rendered.body });
  },

  /**
   * Enqueue + process immediately (max 1) so the center shows live results.
   * Test mode still redirects unless data.sendMode === 'live'.
   */
  sendNow: function(payload) {
    NEXG.Security.requirePermission('email.send');
    payload = payload || {};
    var queued = NEXG.EmailEngine.enqueue({
      templateId: payload.templateId || '',
      recipient: payload.recipient,
      hostId: payload.hostId || '',
      subject: payload.subject || '',
      body: payload.body || '',
      data: payload.data || {},
      metadata: payload.metadata || { source: 'email.center' }
    });
    var processed = NEXG.EmailEngine.processQueue({ maxPerRun: 1 });
    return NEXG.ok({ queued: queued.data, processed: processed.data });
  },

  settings: function() {
    NEXG.Security.requirePermission('email.view');
    return NEXG.ok({
      testMode: NEXG.EmailEngine.isTestMode_(),
      testRecipient: NEXG.EmailEngine.getTestRecipient_()
    });
  },

  saveSettings: function(payload) {
    NEXG.Security.requirePermission('email.send');
    payload = payload || {};
    NEXG.Migrations.upsertSetting('email', 'testMode', { value: !!payload.testMode });
    if (payload.testRecipient !== undefined) {
      NEXG.Migrations.upsertSetting('email', 'testRecipient', { value: String(payload.testRecipient || '').trim() });
    }
    return NEXG.EmailCenter.settings();
  }
};

NEXG.SmartPanel.emailCenter = function() {
  NEXG.Security.requirePermission('email.view');
  var ov = NEXG.EmailCenter.overview();
  if (!ov.success) return ov;
  var logs = NEXG.EmailCenter.logs(20, '');
  return NEXG.ok({
    stats: ov.data.stats,
    queue: ov.data.queue,
    testMode: ov.data.testMode,
    testRecipient: ov.data.testRecipient,
    templateCount: ov.data.templateCount,
    logs: logs.success ? logs.data.logs : []
  });
};

NEXG.SmartPanel.emailPreview = function(payload) {
  NEXG.Security.requirePermission('email.view');
  payload = payload || {};
  return NEXG.EmailCenter.preview(payload.templateId, payload.data || {});
};

NEXG.SmartPanel.emailSaveSettings = function(payload) {
  return NEXG.EmailCenter.saveSettings(payload || {});
};

NEXG.SmartPanel.emailSend = function(payload) {
  return NEXG.EmailCenter.sendNow(payload || {});
};
