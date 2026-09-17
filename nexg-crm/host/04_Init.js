/**
 * NEXG CRM
 * Contract 3 — Initialization, Menu, and App Launchers
 * File: 04_Init.gs
 */

var NEXG = NEXG || {};

NEXG.Initializer = {
  run: function() {
    try {
      return NEXG.Security.runAsSystem(function() {
        NEXG.Migrations.ensureCoreSchemas();
        NEXG.Security.ensureBootstrapAdmin();
        NEXG.Migrations.ensureDefaultStages();
        NEXG.Migrations.ensureDefaultActivityTypes();
        NEXG.Migrations.ensureSchemaVersion();
        NEXG.Migrations.ensureDynamicColumns();
        NEXG.bustBootCache();

        var ss = NEXG.Sheets.getSpreadsheet();

        NEXG.EventBus.publish('system.initialized', {
          spreadsheetId: ss.getId(),
          initializedBy: NEXG.Security.getCurrentUserEmail(),
          at: new Date().toISOString()
        });

        return NEXG.ok({
          initialized: true,
          spreadsheetId: ss.getId(),
          sheets: NEXG.Config.sheetNames
        });
      });
    } catch (err) {
      if (err.name === 'NexgApiError') {
        return NEXG.fail(err.code, err.message, err.details);
      }

      console.error('NEXG initialization failed.', err);

      return NEXG.fail('INIT_FAILED', err.message || 'Initialization failed.');
    }
  }
};

/**
 * Manual initialization function.
 */
function NEXG_initialize() {
  return NEXG.handleApiRequest({
    route: 'system.init'
  });
}

/**
 * Adds NEXG menu to Google Sheets.
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('NEXG CRM')
      .addItem('Initialize Database', 'NEXG_initialize')
      .addSeparator()
      .addItem('Open Smart Panel', 'NEXG_openSmartPanelSidebar')
      .addItem('📊 Dashboard (full screen)', 'NEXG_openDashboardDialog')
      .addItem('✉️ Email Center', 'NEXG_openEmailCenter')
      .addItem('Open Dashboard', 'NEXG_openDashboard')
      .addSeparator()
      .addItem('Open Style Guide', 'NEXG_openStyleGuide')
      .addSeparator()
      .addItem('🛡️ Apply Panel Protections (owner, once)', 'NEXG_applyPanelProtections')
      .addItem('🛡️ Install Guard Triggers (owner, once)', 'NEXG_installPanelGuardTriggers')
      .addItem('🧾 Open Audit Log', 'NEXG_openAuditLog')
      .addToUi();
  } catch (err) {
    console.warn('Could not create NEXG menu.', err);
  }
}

/**
 * Opens the Smart Panel as a Google Sheets sidebar.
 */
function NEXG_openSmartPanelSidebar() {
  var ui = HtmlService.createTemplateFromFile('SmartPanel')
    .evaluate()
    .setTitle('NEXG Smart Panel')
    .setWidth(600);

  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Opens the Email Control Center as a large in-sheet dialog.
 * Runs HEAD code — no deployment bump needed.
 * Permission-gated: teammates without access get a clear denial that
 * tells them how to get added, instead of errors inside the view.
 */
function NEXG_openEmailCenter() {
  var ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (e) { throw new Error('Run this from the sheet menu: NEXG CRM → Email Center.'); }
  try {
    NEXG.Security.requirePermission('email.view');
  } catch (err) {
    ui.alert('✉️ Email Control Center\n\n' + (err.message || 'Access denied.') +
      '\n\nAsk the owner to run from the script editor:\nNEXG_addTeamMember("you@domain.com", "Agent")\n(Roles: Admin, Manager, Agent, Viewer — Viewer sees it but cannot send.)');
    return;
  }
  var html = HtmlService.createTemplateFromFile('EmailCenter').evaluate().setWidth(1280).setHeight(880).setTitle('NEXG Email Control Center');
  ui.showModalDialog(html, ' ');
}

/**
 * Opens the sales-intelligence Dashboard as a large in-sheet dialog
 * (same surface as the merchant CRM). Runs HEAD code — no deployment bump.
 */
function NEXG_openDashboardDialog() {
  var ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (e) { throw new Error('Run this from the sheet menu: NEXG CRM → Dashboard (full screen).'); }
  var html = HtmlService.createTemplateFromFile('Dashboard').evaluate().setWidth(1280).setHeight(880).setTitle('NEXG Host Intelligence');
  ui.showModalDialog(html, ' ');
}

/**
 * Opens the Dashboard in a new browser tab.
 * Uses a launcher dialog to avoid popup blockers.
 */
function NEXG_openDashboard() {
  var ui = SpreadsheetApp.getUi();
  var url = NEXG_getWebAppUrl('?page=dashboard');

  if (!url) {
    ui.alert(
      'NEXG Dashboard is not deployed yet.\n\n' +
      'Go to Deploy → New Deployment → Web App.\n' +
      'Then run this menu again.'
    );
    return;
  }

  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial, sans-serif; padding:16px;">' +
      '<p style="margin-top:0;">' +
        'The NEXG Dashboard opens as a Web App.' +
      '</p>' +
      '<p>' +
        '<a href="' + url + '" target="_blank" ' +
          'style="display:inline-block; padding:10px 16px; background:#3e7bfa; color:#ffffff; ' +
          'text-decoration:none; border-radius:8px; font-weight:bold;">' +
          'Open Dashboard in New Tab' +
        '</a>' +
      '</p>' +
      '<p style="color:#6b7280; font-size:12px; margin-bottom:0;">' +
        'If you see a Google authorization screen, authorize NEXG and reload the page.' +
      '</p>' +
    '</div>'
  ).setWidth(380);

  ui.showModalDialog(html, 'NEXG Dashboard');
}

/**
 * Opens the Style Guide in a new browser tab.
 */
function NEXG_openStyleGuide() {
  var ui = SpreadsheetApp.getUi();
  var url = NEXG_getWebAppUrl('?page=styleguide');

  if (!url) {
    ui.alert(
      'NEXG Style Guide is not deployed yet.\n\n' +
      'Go to Deploy → New Deployment → Web App.\n' +
      'Then run this menu again.'
    );
    return;
  }

  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial, sans-serif; padding:16px;">' +
      '<p style="margin-top:0;">' +
        'The NEXG Style Guide opens as a Web App.' +
      '</p>' +
      '<p>' +
        '<a href="' + url + '" target="_blank" ' +
          'style="display:inline-block; padding:10px 16px; background:#3e7bfa; color:#ffffff; ' +
          'text-decoration:none; border-radius:8px; font-weight:bold;">' +
          'Open Style Guide' +
        '</a>' +
      '</p>' +
    '</div>'
  ).setWidth(380);

  ui.showModalDialog(html, 'NEXG Style Guide');
}

/**
 * Pinned web-app URL. getUrl() is unreliable with several deployments on the
 * project (it can keep returning a deleted one), so the dashboard launcher
 * uses this constant. UPDATE IT whenever a fresh deployment replaces this one.
 */
var NEXG_DASHBOARD_BASE_URL = 'https://script.google.com/macros/s/AKfycbxSpMYcaDKk1nZnEkGu7eSmm6VTPCkl90g3GJTyeJ7TnWO1L6xfQLM7RF0t15zWySWAxg/exec';

/**
 * Returns the deployed Web App URL if available.
 */
function NEXG_getWebAppUrl(path) {
  var base = NEXG_DASHBOARD_BASE_URL || '';
  if (!base) {
    try {
      base = ScriptApp.getService().getUrl();
    } catch (err) {
      base = '';
    }
  }
  if (!base) {
    return '';
  }

  return base + (path || '');
}