/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — LOGGER SERVICE
 * File: EmailLogger.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - Now the SINGLE source of all email logging (B3 fix).
 *   EmailSender.gs no longer logs; Email.gs calls this file exclusively.
 * - Added getLogs() wrapper for the Activity Log panel.
 * - Added getStats() for the Overview stats board.
 * - Made crash-proof: never throws, always returns a result object.
 * - No UX changes. All public method names preserved.
 * ═══════════════════════════════════════════════════════════════════
 */

const EmailLogger = {

  /**
   * Logs an email event to the Email_Logs sheet.
   * This is the ONLY place that writes to Email_Logs.
   *
   * @param {Object} details - {status, testMode, template, recipient, subject,
   *                           merchantId, employeeId, eventId, sentBy, error, payload}
   * @returns {Object} - {success, logId} or {skipped} or {success:false, error}
   */
  log: function (details) {
    details = details || {};

    if (!EmailConfig.isLoggingEnabled()) {
      return { skipped: true, reason: 'Logging is disabled in settings.' };
    }

    var sentBy = '';
    try { sentBy = Session.getActiveUser().getEmail() || ''; } catch (e) {}
    if (!sentBy) {
      try { sentBy = Session.getEffectiveUser().getEmail() || ''; } catch (e) {}
    }

    var logObject = {
      status: details.status || 'INFO',
      testMode: details.testMode || false,
      template: details.template || '',
      recipient: details.recipient || '',
      subject: details.subject || '',
      merchantId: details.merchantId || '',
      employeeId: details.employeeId || '',
      eventId: details.eventId || '',
      sentBy: details.sentBy || sentBy,
      error: details.error || '',
      payload: details.payload || {}
    };

    try {
      var logId = NEXG_EMAIL_appendLog(logObject);
      return { success: true, logId: logId };
    } catch (err) {
      // Logging failure must never break the email send.
      console.error('EmailLogger failed to write to sheet: ' + err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Returns recent logs for the Activity Log panel.
   * Wraps NEXG_EMAIL_getLogs with optional status filter.
   *
   * @param {number} limit - Max rows to return (default 100).
   * @param {string} [statusFilter] - 'ALL', 'SENT', 'FAILED', etc.
   * @returns {Array} - Array of log objects, newest first.
   */
  getLogs: function (limit, statusFilter) {
    try {
      var logs = NEXG_EMAIL_getLogs(limit || 100);
      if (statusFilter && statusFilter !== 'ALL') {
        logs = logs.filter(function (log) {
          return String(log.status || '').toUpperCase() === String(statusFilter).toUpperCase();
        });
      }
      return logs;
    } catch (err) {
      console.error('EmailLogger.getLogs failed: ' + err.message);
      return [];
    }
  },

  /**
   * Returns aggregate stats for the Overview panel.
   * Used by Email.bootstrap() to populate the stats board.
   *
   * @param {number} [limit] - Max logs to scan (default 200).
   * @returns {Object} - {sent, failed, testSends, lastSentAt, totalLogged}
   */
  getStats: function (limit) {
    try {
      var logs = NEXG_EMAIL_getLogs(limit || 200);
      var sent = 0, failed = 0, testSends = 0, lastSentAt = null;

      logs.forEach(function (log) {
        var status = String(log.status || '').toUpperCase();
        var isTest = log.testMode === true || String(log.testMode).toUpperCase() === 'TRUE';

        if (status === 'SENT') {
          sent++;
          if (!lastSentAt) lastSentAt = log.timestamp;
        }
        if (status === 'FAILED') failed++;
        if (isTest) testSends++;
      });

      return {
        sent: sent,
        failed: failed,
        testSends: testSends,
        lastSentAt: lastSentAt,
        totalLogged: logs.length
      };
    } catch (err) {
      console.error('EmailLogger.getStats failed: ' + err.message);
      return { sent: 0, failed: 0, testSends: 0, lastSentAt: null, totalLogged: 0 };
    }
  }
};