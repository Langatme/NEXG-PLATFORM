/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — CONFIG SERVICE
 * File: EmailConfig.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - Extracted cleanly from EmailCenterJS.html (was appended there by
 *   a previous patch session).
 * - Added FROM_EMAIL to defaults + descriptions so the alias field
 *   is always present in Settings.
 * - Hardened toBoolean_ and isEmail_ to never throw.
 * - No UX changes. All public method names preserved.
 * ═══════════════════════════════════════════════════════════════════
 */

const EmailConfig = {

  descriptions: {
    ADMIN_EMAIL:    'Admin recipient used for tests, previews, and failure alerts.',
    FROM_NAME:      'Sender name shown in outgoing emails.',
    FROM_EMAIL:     'Verified Gmail alias to send from (e.g. merchant@nexgapp.com).',
    REPLY_TO:       'Reply-to address. Leave blank to use the default sender.',
    COMPANY_NAME:   'Company name used in email templates and footer.',
    WEBSITE:        'Company website used in email footer.',
    PHONE:          'Company phone used in email footer.',
    SIGNATURE_HTML: 'HTML signature appended to email bodies.',
    TIMEZONE:       'Timezone used for rendering dates and times in emails.',
    TEST_MODE:      'When TRUE, outgoing emails are redirected to ADMIN_EMAIL.',
    ENABLE_LOGGING: 'When TRUE, email activity is written to Email_Logs.',
    LOGO_FILE_ID:   'Google Drive file ID of the inline logo image.'
  },

  defaults: {
    ADMIN_EMAIL:    '',
    FROM_NAME:      'NEXG',
    FROM_EMAIL:     '',
    REPLY_TO:       '',
    COMPANY_NAME:   'NEXG',
    WEBSITE:        '',
    PHONE:          '',
    SIGNATURE_HTML: '<p>Best regards,</p><p><strong>NEXG Team</strong></p>',
    TIMEZONE:       '',
    TEST_MODE:      true,
    ENABLE_LOGGING: true,
    LOGO_FILE_ID:   ''
  },

  /**
   * Initializes the Email_Settings and Email_Logs sheets.
   */
  init: function () {
    return NEXG_EMAIL_initializeEmailSheets();
  },

  /**
   * Returns the full email configuration object.
   */
  all: function () {
    var stored = NEXG_EMAIL_getAllSettings();
    var config = {};

    Object.keys(EmailConfig.defaults).forEach(function (key) {
      var storedValue = stored[key];
      var hasStoredValue = (storedValue !== undefined && String(storedValue).trim() !== '');
      config[key] = hasStoredValue ? storedValue : EmailConfig.defaults[key];
    });

    // Preserve any custom keys not in defaults
    Object.keys(stored).forEach(function (key) {
      if (!config.hasOwnProperty(key)) {
        config[key] = stored[key];
      }
    });

    config.TEST_MODE      = EmailConfig.toBoolean_(config.TEST_MODE);
    config.ENABLE_LOGGING = EmailConfig.toBoolean_(config.ENABLE_LOGGING);

    if (!config.TIMEZONE) {
      try { config.TIMEZONE = Session.getScriptTimeZone(); } catch (e) { config.TIMEZONE = 'Africa/Nairobi'; }
    }

    return config;
  },

  /**
   * Returns one config value.
   */
  get: function (key) {
    var normalizedKey = EmailConfig.normalizeKey_(key);
    var config = EmailConfig.all();
    return config.hasOwnProperty(normalizedKey) ? config[normalizedKey] : '';
  },

  /**
   * Sets one config value.
   */
  set: function (key, value) {
    var normalizedKey = EmailConfig.normalizeKey_(key);
    var description = EmailConfig.descriptions[normalizedKey] || '';
    return NEXG_EMAIL_setSetting(normalizedKey, value, description);
  },

  /**
   * Saves multiple config values at once.
   */
  save: function (settings) {
    settings = settings || {};
    var updated = [];
    Object.keys(settings).forEach(function (key) {
      var result = EmailConfig.set(key, settings[key]);
      updated.push(result.key);
    });
    return { ok: true, updated: updated };
  },

  /**
   * Returns true when test mode is enabled.
   */
  isTestMode: function () {
    return EmailConfig.get('TEST_MODE') === true;
  },

  /**
   * Returns true when logging is enabled.
   */
  isLoggingEnabled: function () {
    return EmailConfig.get('ENABLE_LOGGING') === true;
  },

  /**
   * Returns the configured admin email.
   */
  adminEmail: function () {
    return String(EmailConfig.get('ADMIN_EMAIL') || '').trim();
  },

  /**
   * In test mode, redirects to admin email. Otherwise returns intended recipient.
   */
  safeRecipient: function (recipient) {
    var cleanedRecipient = String(recipient || '').trim();
    if (!EmailConfig.isTestMode()) {
      return cleanedRecipient;
    }
    var admin = EmailConfig.adminEmail();
    if (!EmailConfig.isEmail_(admin)) {
      throw new Error(
        'EmailConfig.safeRecipient: TEST_MODE is enabled, but ADMIN_EMAIL is not valid. Set ADMIN_EMAIL before testing.'
      );
    }
    return admin;
  },

  /**
   * Validates the current configuration.
   */
  validate: function () {
    var config = EmailConfig.all();
    var errors = [];
    var warnings = [];

    if (!EmailConfig.isEmail_(config.ADMIN_EMAIL)) {
      errors.push('ADMIN_EMAIL must be a valid email address.');
    }
    if (!config.FROM_NAME) {
      errors.push('FROM_NAME is required.');
    }
    if (config.REPLY_TO && !EmailConfig.isEmail_(config.REPLY_TO)) {
      warnings.push('REPLY_TO is not a valid email address. The default sender will be used.');
    }
    if (config.FROM_EMAIL && !EmailConfig.isEmail_(config.FROM_EMAIL)) {
      warnings.push('FROM_EMAIL is not a valid email address. The default Gmail sender will be used.');
    }
    if (config.TEST_MODE) {
      warnings.push('TEST_MODE is enabled. Outbound emails will be redirected to ADMIN_EMAIL.');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      config: config
    };
  },

  /* ── private helpers ─────────────────────────────────────────── */

  normalizeKey_: function (key) {
    return String(key || '').trim().toUpperCase().replace(/\s+/g, '_');
  },

  toBoolean_: function (value) {
    if (typeof value === 'boolean') return value;
    var text = String(value || '').trim().toUpperCase();
    return text === 'TRUE' || text === 'YES' || text === '1' || text === 'ON';
  },

  isEmail_: function (value) {
    var email = String(value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Step 1 test: initializes sheets, fills ADMIN_EMAIL, forces TEST_MODE,
   * validates config, writes a test log.
   */
  testStep1: function () {
    var init = EmailConfig.init();
    var currentUser = '';

    if (!EmailConfig.adminEmail()) {
      try { currentUser = Session.getActiveUser().getEmail() || ''; } catch (err) {}
      if (!currentUser) {
        try { currentUser = Session.getEffectiveUser().getEmail() || ''; } catch (err) {}
      }
      if (currentUser) {
        EmailConfig.set('ADMIN_EMAIL', currentUser);
      }
    }

    EmailConfig.set('TEST_MODE', true);
    var validation = EmailConfig.validate();

    var logId = NEXG_EMAIL_appendLog({
      status: 'STEP1_TEST',
      testMode: EmailConfig.isTestMode(),
      template: 'STEP1_TEST',
      recipient: EmailConfig.adminEmail() || currentUser || 'MISSING_ADMIN_EMAIL',
      subject: 'NEXG Email System — Step 1 Test',
      merchantId: 'M-000',
      employeeId: 'E-000',
      eventId: 'EVT-000',
      sentBy: EmailConfig.adminEmail() || currentUser || 'SYSTEM',
      payload: {
        step: 1,
        message: 'Email configuration and logging foundation test.'
      }
    });

    var latestLogs = NEXG_EMAIL_getLogs(5);

    return {
      ok: true,
      init: init,
      currentUser: currentUser,
      adminEmail: EmailConfig.adminEmail(),
      validation: validation,
      testLogId: logId,
      latestLogs: latestLogs
    };
  }
};

/**
 * Convenience runner for the Apps Script editor.
 */
function runEmailStep1Test() {
  return EmailConfig.testStep1();
}

/**
 * Optional convenience function for initial setup.
 */
function initializeEmailSystem() {
  return EmailConfig.init();
}