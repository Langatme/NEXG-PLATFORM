/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — SENDER SERVICE
 * File: EmailSender.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - FIX B2: Removed the broken patch block inside the `try` that
 *   referenced `err.message` where `err` was undefined, causing a
 *   ReferenceError on EVERY successful send.
 * - FIX B3: Removed ALL `NEXG_EMAIL_appendLog` calls from this file.
 *   Logging is now exclusively handled by EmailLogger.gs via Email.gs.
 *   This kills the double-row logging problem.
 * - FIX B4: Hardened sendMode override. The per-send UI choice
 *   ('test' | 'live') passed via sendOptions now definitively
 *   overrides the sheet's TEST_MODE setting end-to-end.
 * - Added `intendedRecipient` to return object so Email.gs can log
 *   both the intended and actual recipients.
 * - No UX changes. All public method names preserved.
 * ═══════════════════════════════════════════════════════════════════
 */

const EmailSender = {

  /**
   * Returns true if a logo file ID is configured in Email_Settings.
   */
  hasLogo: function () {
    return String(EmailConfig.get('LOGO_FILE_ID') || '').trim() !== '';
  },

  /**
   * Fetches the logo from Google Drive and forces the correct MIME type
   * so Gmail renders it inline via CID rather than as a standard attachment.
   */
  getLogoBlob: function () {
    var fileId = String(EmailConfig.get('LOGO_FILE_ID') || '').trim();
    if (!fileId) {
      console.warn('EmailSender: No LOGO_FILE_ID configured.');
      return null;
    }
    try {
      var file = DriveApp.getFileById(fileId);
      var blob = file.getBlob();
      var name = (blob.getName() || '').toLowerCase();

      // Force correct MIME type for inline rendering
      if (name.indexOf('.png') !== -1) {
        blob.setContentType('image/png');
      } else if (name.indexOf('.jpg') !== -1 || name.indexOf('.jpeg') !== -1) {
        blob.setContentType('image/jpeg');
      } else if (name.indexOf('.gif') !== -1) {
        blob.setContentType('image/gif');
      } else {
        blob.setContentType('image/png'); // Fallback
      }

      console.log('EmailSender: Logo loaded. MIME: ' + blob.getContentType());
      return blob;
    } catch (err) {
      console.error('EmailSender: logo load failed (' + fileId + '): ' + err.message);
      return null;
    }
  },

  /**
   * Returns a base64 data URI of the logo for preview modes.
   */
  getLogoDataUri: function () {
    var blob = this.getLogoBlob();
    if (!blob) return '';
    try {
      var ct = blob.getContentType() || 'image/png';
      return 'data:' + ct + ';base64,' + Utilities.base64Encode(blob.getBytes());
    } catch (err) {
      return '';
    }
  },

  /**
   * Safe email getter that never crashes on missing scope.
   */
  getUserEmail_: function () {
    try { return Session.getActiveUser().getEmail(); } catch (e) {}
    try { return Session.getEffectiveUser().getEmail(); } catch (e) {}
    return '';
  },

  /**
   * Sends email via GmailApp with alias support.
   *
   * @param {string} to            - Intended recipient
   * @param {string} subject       - Email subject
   * @param {string} htmlBody      - HTML body
   * @param {Blob}   [logoBlob]    - Optional inline logo
   * @param {Object} [sendOptions] - { sendMode, attachments, fromEmail }
   * @returns {Object}             - {success, recipient, intendedRecipient,
   *                                  subject, from, testMode, sendMode, error?}
   */
  send: function (to, subject, htmlBody, logoBlob, sendOptions) {
    sendOptions = sendOptions || {};
    var cfg = EmailConfig.all();

    // ── 1. Resolve send mode (per-send UI choice beats sheet config) ──
    var requestedMode = String(sendOptions.sendMode || '').trim().toLowerCase();
    var isTestMode;

    if (requestedMode === 'live') {
      isTestMode = false;
    } else if (requestedMode === 'test') {
      isTestMode = true;
    } else {
      isTestMode = cfg.TEST_MODE === true;
    }

    // ── 2. Resolve recipient (test-mode redirect) ──
    var intendedTo = String(to || '').trim();
    var actualTo = intendedTo;
    var actualSubject = subject;

    if (isTestMode) {
      var adminEmail = String(cfg.ADMIN_EMAIL || '').trim();
      if (!EmailConfig.isEmail_(adminEmail)) {
        throw new Error('EmailSender: TEST_MODE is on but ADMIN_EMAIL is missing or invalid.');
      }
      actualTo = adminEmail;
      actualSubject = '[TEST] ' + subject;
    }

    if (!EmailConfig.isEmail_(actualTo)) {
      throw new Error('EmailSender: Invalid recipient: ' + actualTo);
    }

    // ── 3. Build GmailApp options ──
    var options = {
      htmlBody: htmlBody,
      name: String(cfg.FROM_NAME || 'NEXG').trim()
    };

    if (cfg.REPLY_TO && EmailConfig.isEmail_(cfg.REPLY_TO)) {
      options.replyTo = cfg.REPLY_TO;
    }

    // Alias support: only GmailApp respects the 'from' option
    var fromEmail = String(sendOptions.fromEmail || cfg.FROM_EMAIL || '').trim();
    if (fromEmail && EmailConfig.isEmail_(fromEmail)) {
      options.from = fromEmail;
    }

    if (logoBlob) {
      options.inlineImages = { nexg_logo: logoBlob };
    }

    if (sendOptions.attachments && sendOptions.attachments.length) {
      options.attachments = sendOptions.attachments;
    }

    // ── 4. Send ──
    try {
      GmailApp.sendEmail(actualTo, actualSubject, '', options);

      // SUCCESS — return cleanly. No logging here (Email.gs handles it).
      return {
        success: true,
        recipient: actualTo,
        intendedRecipient: intendedTo,
        subject: actualSubject,
        from: options.from || '',
        testMode: isTestMode,
        sendMode: isTestMode ? 'test' : 'live'
      };

    } catch (err) {
      // FAILURE — return error details. No logging here (Email.gs handles it).
      return {
        success: false,
        error: err.message,
        recipient: actualTo,
        intendedRecipient: intendedTo,
        subject: actualSubject,
        from: options.from || '',
        testMode: isTestMode,
        sendMode: isTestMode ? 'test' : 'live'
      };
    }
  }
};

/**
 * One-click alias test.
 * Run this from the Apps Script editor (▶).
 */
function testEmailAlias() {
  var cfg = EmailConfig.all();
  if (!cfg.ADMIN_EMAIL) {
    throw new Error('Set ADMIN_EMAIL in the Email_Settings sheet first.');
  }
  var result = EmailSender.send(
    cfg.ADMIN_EMAIL,
    'NEXG Alias Test — ' + new Date().toLocaleString(),
    '<p style="font-family:sans-serif;font-size:15px">If you see this from <strong>' +
    (cfg.FROM_EMAIL || 'default') + '</strong>, the alias is working.</p>'
  );
  if (!result.success) {
    throw new Error(result.error);
  }
  return 'Sent from: ' + (result.from || 'default') + ' | Check inbox: ' + cfg.ADMIN_EMAIL;
}