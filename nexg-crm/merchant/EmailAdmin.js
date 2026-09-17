/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG EMAIL — ADMIN AUTHORIZATION (IDENTITY GATE + OPTIONAL TOKEN)
 * File: EmailAdmin.gs
 * Version: 2.0.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - Extracted cleanly from the Email.gs monolith (was appended at the
 *   bottom of Email.gs by a previous patch session).
 * - No logic changes. All public method names and global entry points
 *   preserved exactly (assertAccess, cardData, getEmailCenterCardData,
 *   runEmailAdminSetup, getEmailCenterUrl, doGet gate).
 * - cardData() now reads through EmailLogger (crash-proof) so the
 *   dashboard Communications card never throws.
 * - The in-dashboard modal is gated by assertAccess() (signed-in
 *   identity). The token + serveIfAuthorized pieces remain an OPTIONAL
 *   fallback for a standalone web-app URL.
 * ═══════════════════════════════════════════════════════════════════
 */

const EmailAdmin = {
  ADMIN_KEY: 'ADMIN_USERS',
  TOKEN_KEY: 'ACCESS_TOKEN',

  /** Seeds the owner's email as the first admin (runs once). */
  ensureSeeded_: function () {
    const current = NEXG_EMAIL_getSetting(this.ADMIN_KEY);
    if (!current || !String(current).trim()) {
      let owner = '';
      try { owner = Session.getEffectiveUser().getEmail() || ''; } catch (err) {}
      if (owner) {
        NEXG_EMAIL_setSetting(this.ADMIN_KEY, owner,
          'Comma-separated emails allowed to open the Email Control Center.');
      }
    }
  },

  /** Signed-in email. Fails closed (no effective-user fallback). */
  getCurrentUserEmail: function () {
    let email = '';
    try { email = Session.getActiveUser().getEmail() || ''; } catch (err) {}
    return String(email).trim().toLowerCase();
  },

  getAdminUsers: function () {
    this.ensureSeeded_();
    const raw = String(NEXG_EMAIL_getSetting(this.ADMIN_KEY) || '');
    return raw.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  },

  isAuthorized: function (email) {
    const n = String(email || '').trim().toLowerCase();
    if (!n) return false;
    return this.getAdminUsers().indexOf(n) !== -1;
  },

  /** Hard gate for the modal, the card, and every cc* call. */
  assertAccess: function () {
    const email = this.getCurrentUserEmail();
    if (!this.isAuthorized(email)) {
      throw new Error('Access denied. ' + (email || 'Unknown user (open the Sheet first and authorize: NEXG CRM → Open Smart Panel → Allow)')
        + ' is not an authorized administrator. Ask the owner (usernamepgbc@gmail.com) to add your email to the Email_Settings sheet → ADMIN_USERS (comma-separated), or run addEmailCenterAdmin("you@domain.com") from the script editor, then re-open the Sheet.');
    }
    return email;
  },

  /* ----- OPTIONAL web-app token (only used by serveIfAuthorized) ----- */

  getAccessToken_: function (create) {
    let t = String(NEXG_EMAIL_getSetting(this.TOKEN_KEY) || '').trim();
    if (t) return t;
    if (create === false) return '';
    t = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    try {
      NEXG_EMAIL_setSetting(this.TOKEN_KEY, t,
        'Secret web-app token for the Email Control Center. Treat like a password.');
    } catch (err) {}
    return t;
  },

  buildUrl_: function () {
    let base = '';
    try { base = ScriptApp.getService().getUrl(); } catch (err) { base = ''; }
    if (!base) return '';
    return base + (base.indexOf('?') === -1 ? '?' : '&') + 't=' + this.getAccessToken_();
  },

  /** Web-app gate: correct token OR authorized identity. */
  serveIfAuthorized: function (e) {
    e = e || {}; e.parameter = e.parameter || {};
    const token = String(e.parameter.t || '').trim();
    if (token && token === this.getAccessToken_(false)) {
      return Email.serve();
    }
    const email = this.getCurrentUserEmail();
    if (this.isAuthorized(email)) {
      return Email.serve();
    }
    return this.denialPage_(email || 'no access');
  },

  /** Data for the dashboard COMMUNICATIONS card (gated; owner only). */
  cardData: function () {
    const email = this.assertAccess();
    let logs = [];
    try { logs = EmailLogger.getLogs(200); } catch (err) { logs = []; }

    let sent = 0, failed = 0;
    logs.forEach(function (log) {
      const st = String(log.status || '').toUpperCase();
      if (st === 'SENT') sent++;
      if (st === 'FAILED') failed++;
    });

    return {
      authorized: true,
      adminEmail: email,
      sent: sent,
      failed: failed,
      total: logs.length,
      testMode: EmailConfig.isTestMode() === true,
      url: this.buildUrl_()   // only meaningful for the optional web-app path
    };
  },

  addAdminUser: function (email) {
    this.assertAccess();
    const n = String(email || '').trim().toLowerCase();
    if (!EmailConfig.isEmail_(n)) throw new Error('Invalid email address.');
    const admins = this.getAdminUsers();
    if (admins.indexOf(n) === -1) admins.push(n);
    NEXG_EMAIL_setSetting(this.ADMIN_KEY, admins.join(', '),
      'Comma-separated emails allowed to open the Email Control Center.');
    return admins;
  },

  removeAdminUser: function (email) {
    this.assertAccess();
    const n = String(email || '').trim().toLowerCase();
    const admins = this.getAdminUsers().filter(function (a) { return a !== n; });
    NEXG_EMAIL_setSetting(this.ADMIN_KEY, admins.join(', '),
      'Comma-separated emails allowed to open the Email Control Center.');
    return admins;
  },

  /** Branded "access restricted" page (web-app path only). */
  denialPage_: function (email) {
    const safe = String(email || 'unknown').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
    const html =
      '<!DOCTYPE html><html><head><base target="_self"><meta charset="utf-8">' +
      '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">' +
      '<style>' +
      'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
      'background:#0a1c38;background-image:radial-gradient(rgba(61,130,234,.14) 1px,transparent 1.4px);background-size:26px 26px;' +
      'font-family:"IBM Plex Sans",sans-serif;color:#c7d4e8;}' +
      '.deny{max-width:440px;text-align:center;padding:48px 40px;background:rgba(16,41,78,.7);border:1px solid rgba(93,124,173,.35);border-radius:14px;}' +
      '.deny-mark{width:52px;height:52px;margin:0 auto 20px;border-radius:12px;background:linear-gradient(135deg,#1a63d6,#00357f);' +
      'color:#fff;font:700 30px/52px "Barlow Condensed",sans-serif;text-align:center;}' +
      'h1{font:700 30px/1.1 "Barlow Condensed",sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#fff;margin:0 0 10px;}' +
      'p{font-size:14px;line-height:1.6;margin:0 0 14px;}' +
      '.who{font-family:"IBM Plex Mono",monospace;font-size:12px;color:#8fa6c9;background:rgba(7,21,39,.6);padding:8px 12px;border-radius:6px;display:inline-block;}' +
      '.hint{font-size:12px;color:#6d84a8;}' +
      '</style></head><body>' +
      '<div class="deny"><div class="deny-mark">N</div><h1>Access restricted</h1>' +
      '<p>The NEXG Email Control Center is limited to authorized administrators.</p>' +
      '<div class="who">signed in as: ' + safe + '</div>' +
      '<p class="hint" style="margin-top:16px;">If you believe you should have access, contact your system owner.</p>' +
      '</div></body></html>';
    return HtmlService.createHtmlOutput(html)
      .setTitle('Access restricted — NEXG')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
};

/* ── GLOBAL ENTRY POINTS (EmailAdmin) ───────────────────────────── */

/** Run once from the editor: seeds you as admin (+ token for the optional web app) and logs the URL. */
function runEmailAdminSetup() {
  EmailAdmin.ensureSeeded_();
  const token = EmailAdmin.getAccessToken_();
  const url = EmailAdmin.buildUrl_();
  const admins = EmailAdmin.getAdminUsers();
  console.log('Authorized admins:', admins.join(', '));
  console.log('Email Center URL (optional web app):', url);
  return { admins: admins, token: token, url: url };
}

/** Dashboard card data (gated). */
function getEmailCenterCardData() {
  return EmailAdmin.cardData();
}

/** Convenience: returns the optional tokenized web-app URL. */
function getEmailCenterUrl() {
  EmailAdmin.assertAccess();
  return EmailAdmin.buildUrl_();
}