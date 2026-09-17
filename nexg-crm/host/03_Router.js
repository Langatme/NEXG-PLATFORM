/**
 * NEXG CRM
 * Contract 3 — Router
 * File: 03_Router.gs
 */

function doGet(e) {
  e = e || {};

  var page = e.parameter && e.parameter.page ? e.parameter.page : 'panel';

  if (page === 'styleguide') {
    return NEXG_renderTemplate('StyleGuide', 'NEXG CRM — Design System');
  }

  if (page === 'dashboard') {
    return NEXG_renderTemplate('Dashboard', 'NEXG CRM — Dashboard');
  }

  return NEXG_renderTemplate('SmartPanel', 'NEXG CRM — Smart Panel');
}

function NEXG_renderTemplate(templateName, title) {
  return HtmlService.createTemplateFromFile(templateName)
    .evaluate()
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Required by every HTML template.
 * Must exist exactly ONCE in the project.
 */
function NEXG_include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}