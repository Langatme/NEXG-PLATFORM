/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — PUBLIC API & ORCHESTRATOR
 * File: Email.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - EmailAdmin object + its global entry points EXTRACTED to
 *   EmailAdmin.gs (this file is now the orchestrator only).
 * - Single logging path: Email.gs logs exclusively via EmailLogger.gs.
 *   (EmailSender.gs no longer logs — kills B3 double-logging.)
 * - sendMode travels end-to-end:
 *   panel → ccSend → sendFromCenter → Email.send → EmailSender.send (B4).
 * - bootstrap() and logs() are now crash-proof (never throw) and read
 *   through EmailLogger, so Overview stats + Activity Log render even
 *   if the sheet is imperfect (B1 hardening).
 * - All public API names preserved exactly.
 * ═══════════════════════════════════════════════════════════════════
 */

const Email = {

  send: function (templateKey, recipient, data, metadata) {
    metadata = metadata || {};
    const requestedSendMode = String(metadata.sendMode || '').trim().toLowerCase();

    let effectiveTestMode;
    if (requestedSendMode === 'test') effectiveTestMode = true;
    else if (requestedSendMode === 'live') effectiveTestMode = false;
    else effectiveTestMode = EmailConfig.isTestMode();

    try {
      const logoBlob = EmailSender.getLogoBlob();
      const htmlBody = EmailRenderer.render(templateKey, data, { logoCid: !!logoBlob });
      const subject = EmailRenderer.renderSubject(templateKey, data);

      const attachments = [];
      if (typeof EmailCalendar !== 'undefined') {
        try {
          const icsBlob = EmailCalendar.icsBlob(data);
          if (icsBlob) attachments.push(icsBlob);
        } catch (calErr) {
          console.warn('Email.send: calendar attachment skipped: ' + calErr.message);
        }
      }

      const sendResult = EmailSender.send(recipient, subject, htmlBody, logoBlob, {
        sendMode: requestedSendMode || (effectiveTestMode ? 'test' : 'live'),
        attachments: attachments,
        fromEmail: metadata.fromEmail
      });

      const logDetails = {
        status: sendResult.success ? 'SENT' : 'FAILED',
        testMode: sendResult.testMode,
        template: templateKey,
        recipient: sendResult.recipient || recipient,
        subject: sendResult.subject || subject,
        merchantId: metadata.merchantId || '',
        employeeId: metadata.employeeId || '',
        eventId: metadata.eventId || '',
        error: sendResult.error || '',
        payload: {
          sendMode: sendResult.sendMode || (sendResult.testMode ? 'test' : 'live'),
          intendedRecipient: sendResult.intendedRecipient || recipient,
          from: sendResult.from || '',
          mergeData: data
        }
      };
      const logResult = EmailLogger.log(logDetails);

      return {
        success: sendResult.success,
        sentTo: sendResult.recipient,
        intendedTo: sendResult.intendedRecipient || recipient,
        subject: sendResult.subject,
        testMode: sendResult.testMode,
        sendMode: sendResult.sendMode || (sendResult.testMode ? 'test' : 'live'),
        from: sendResult.from || '',
        logId: logResult.logId || null,
        error: sendResult.error || null
      };

    } catch (err) {
      const logResult = EmailLogger.log({
        status: 'FAILED',
        testMode: effectiveTestMode,
        template: templateKey,
        recipient: recipient || '',
        subject: '',
        merchantId: metadata.merchantId || '',
        employeeId: metadata.employeeId || '',
        eventId: metadata.eventId || '',
        error: err.message,
        payload: {
          stage: 'render_or_prepare',
          sendMode: requestedSendMode || (effectiveTestMode ? 'test' : 'live'),
          intendedRecipient: recipient || '',
          mergeData: data
        }
      });

      return {
        success: false,
        sentTo: recipient || '',
        intendedTo: recipient || '',
        subject: '',
        testMode: effectiveTestMode,
        sendMode: requestedSendMode || (effectiveTestMode ? 'test' : 'live'),
        from: '',
        logId: logResult.logId || null,
        error: err.message
      };
    }
  },

  preview: function (templateKey, data) {
    const logoDataUri = EmailSender.getLogoDataUri();
    const htmlBody = EmailRenderer.render(templateKey, data, { logoDataUri: logoDataUri });
    const subject = EmailRenderer.renderSubject(templateKey, data);
    return { subject: subject, html: htmlBody };
  },

  serve: function () {
    return HtmlService.createTemplateFromFile('EmailCenter')
      .evaluate()
      .setTitle('NEXG Email Control Center')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  bootstrap: function () {
    try {
      const config = EmailConfig.all();
      const templates = (typeof EmailTemplates !== 'undefined') ? EmailTemplates.all() : [];
      const stats = EmailLogger.getStats(200);
      const recentLogs = EmailLogger.getLogs(8);

      return {
        ok: true,
        config: {
          testMode: config.TEST_MODE === true,
          adminEmail: config.ADMIN_EMAIL,
          fromName: config.FROM_NAME,
          fromEmail: config.FROM_EMAIL || '',
          logoConfigured: EmailSender.hasLogo()
        },
        stats: {
          sent: stats.sent,
          failed: stats.failed,
          testSends: stats.testSends,
          lastSentAt: stats.lastSentAt,
          totalLogged: stats.totalLogged
        },
        templates: templates,
        recentLogs: recentLogs
      };
    } catch (err) {
      // Never throw — return a safe shell so the UI can still render.
      console.error('Email.bootstrap failed: ' + err.message);
      return {
        ok: false,
        error: err.message,
        config: { testMode: false, adminEmail: '', fromName: '', fromEmail: '', logoConfigured: false },
        stats: { sent: 0, failed: 0, testSends: 0, lastSentAt: null, totalLogged: 0 },
        templates: [],
        recentLogs: []
      };
    }
  },

  logs: function (limit, statusFilter) {
    try {
      return EmailLogger.getLogs(limit || 100, statusFilter);
    } catch (err) {
      console.error('Email.logs failed: ' + err.message);
      return [];
    }
  },

  sendFromCenter: function (templateKey, recipient, data, sendMode) {
    return Email.send(templateKey, recipient, data, { sendMode: sendMode });
  },

  settings: function () {
    return EmailConfig.all();
  },

  saveSettings: function (settings) {
    const result = EmailConfig.save(settings);
    return {
      ok: true,
      updated: result.updated,
      validation: EmailConfig.validate()
    };
  }
};

/* ── GLOBAL ENTRY POINTS (Email orchestrator) ───────────────────── */

function necTemplatesJson() {
  try { return JSON.stringify(EmailTemplates.all()).replace(/<\//g, '<\\/'); }
  catch (e) { return '[]'; }
}

function getEmailCenterHtml() { EmailAdmin.assertAccess(); return Email.serve().getContent(); }

function getEmailCenterMarkup() { EmailAdmin.assertAccess(); return HtmlService.createTemplateFromFile('EmailCenterBody').evaluate().getContent(); }

function ccBootstrap() { EmailAdmin.assertAccess(); return Email.bootstrap(); }

function ccLogs(limit, statusFilter) { EmailAdmin.assertAccess(); return Email.logs(limit, statusFilter); }

function ccPreview(templateKey, data) { EmailAdmin.assertAccess(); return Email.preview(templateKey, data); }

function ccSend(templateKey, recipient, data, sendMode) { EmailAdmin.assertAccess(); return Email.sendFromCenter(templateKey, recipient, data, sendMode); }

function ccSettings() { EmailAdmin.assertAccess(); return Email.settings(); }

function ccSaveSettings(settings) { EmailAdmin.assertAccess(); return Email.saveSettings(settings); }

function doGet(e) { return EmailAdmin.serveIfAuthorized(e || {}); }

function runStep2Test() {
  EmailConfig.init();
  const mockData = {
    business_name: 'Acme Coffee Roasters', contact_person: 'Jane Doe',
    meeting_date: 'August 12, 2026', meeting_time: '2:00 PM EAT', sales_rep: 'John Smith'
  };
  const result = Email.send('MEETING_CONFIRMATION', 'client@acmecoffee.com', mockData, { merchantId: 'M-1001' });
  console.log('Email send result:', JSON.stringify(result, null, 2));
  return result;
}

function diagTemplates() {
  var r = {};
  r.defined = (typeof EmailTemplates !== 'undefined');
  if (!r.defined) { console.log('DIAG ' + JSON.stringify(r)); return r; }
  try { r.listCount = EmailTemplates.list().length; } catch (e) { r.listError = String(e); }
  try { r.allCount = EmailTemplates.all().length; } catch (e) { r.allError = String(e); }
  console.log('DIAG ' + JSON.stringify(r, null, 2));
  return r;
}