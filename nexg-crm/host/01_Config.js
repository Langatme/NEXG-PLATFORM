/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 01_Config.gs
 *
 * Purpose:
 * - Central configuration
 * - Sheet names
 * - ID prefixes
 * - Script property keys
 */

var NEXG = NEXG || {};

NEXG.Config = {
  appName: 'NEXG CRM',
  version: '1.0.0',

  /**
   * Optional spreadsheet ID.
   * If blank, NEXG uses the active spreadsheet.
   * If no active spreadsheet exists, NEXG creates one and stores its ID.
   */
  spreadsheetId: '',

  scriptPropertyKeys: {
    spreadsheetId: 'NEXG_SPREADSHEET_ID',
    adminEmail: 'NEXG_ADMIN_EMAIL'
  },

  sheetNames: {
    hosts: 'Hosts',
    activities: 'Activities',
    meetings: 'Meetings',
    emailLogs: 'EmailLogs',
    settings: 'Settings'
  },

  idPrefixes: {
    host: 'HST',
    activity: 'ACT',
    meeting: 'MTG',
    email: 'EML',
    settings: 'SET'
  },

  timezone: (function() {
    try {
      return Session.getScriptTimeZone() || 'UTC';
    } catch (err) {
      return 'UTC';
    }
  })(),

  /**
   * When true, the first run allows bootstrap access before permissions exist.
   * After permissions are initialized, normal security enforcement applies.
   */
  allowBootstrapMode: true,

  searchLimit: 100
};