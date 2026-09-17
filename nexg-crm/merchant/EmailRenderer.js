/*************************************************************
 * NEXG EMAIL — HTML RENDERER
 * File: EmailRenderer.gs  (replace the whole file)
 *************************************************************/

const EmailRenderer = {
  render: function (templateKey, data, options) {
    options = options || {};
    const templateDef = EmailTemplates.get(templateKey);
    if (!templateDef) {
      throw new Error('EmailRenderer: Template not found for key: ' + templateKey);
    }

    let masterHtml = '';
    try {
      masterHtml = HtmlService.createHtmlOutputFromFile('EmailMasterLayout').getContent();
    } catch (err) {
      throw new Error('EmailRenderer: Could not load EmailMasterLayout.html. Error: ' + err.message);
    }

    // Body comes from the registry string, or a file if one is specified.
    let bodyHtml = '';
    if (templateDef.html) {
      bodyHtml = templateDef.html;
    } else {
      try {
        bodyHtml = HtmlService.createHtmlOutputFromFile(templateDef.file).getContent();
      } catch (err) {
        throw new Error('EmailRenderer: Could not load HTML file "' + templateDef.file + '". Error: ' + err.message);
      }
    }

    data = data || {};

    // CTA button: only renders when there is BOTH a label and a link.
    const ctaLabel = data.cta_label || templateDef.ctaLabel || '';
    const ctaUrl = data.cta_link || templateDef.ctaUrl || '';
    data.cta_block = this.ctaBlock_(ctaLabel, ctaUrl);
    data.calendar_block = EmailCalendar.blockFor(data);
    // Replace every {{variable}} ($-safe).
    Object.keys(data).forEach(function (key) {
      const regex = new RegExp('{{' + key + '}}', 'g');
      const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
      bodyHtml = bodyHtml.replace(regex, function () { return value; });
    });

    // Tidy any placeholder the sender left blank.
    bodyHtml = bodyHtml.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '');

    masterHtml = masterHtml.replace('{{email_body_content}}', bodyHtml);
    masterHtml = masterHtml.replace('{{header_content}}', this.buildHeader_(options));
    masterHtml = masterHtml.replace('{{current_year}}', new Date().getFullYear());

    return masterHtml;
  },

  /** Email-safe CTA button table, or '' when there is nothing to link to. */
  ctaBlock_: function (label, url) {
    label = String(label || '').trim();
    url = String(url || '').trim();
    if (!label || !url) return '';
    const e = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    return '<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;border-collapse:collapse;">' +
      '<tr><td align="center" style="border-radius:6px;background-color:#004aad;">' +
      '<a href="' + e(url) + '" target="_blank" style="display:inline-block;padding:13px 26px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">' + e(label) + '</a>' +
      '</td></tr></table>';
  },

  buildHeader_: function (options) {
    const imgStyle = 'display:block;margin:0 auto;width:auto;height:auto;max-width:320px;max-height:120px;border:0;outline:none;text-decoration:none;';
    if (options.logoCid) return '<img src="cid:nexg_logo" alt="NEXG" style="' + imgStyle + '" />';
    if (options.logoDataUri) return '<img src="' + options.logoDataUri + '" alt="NEXG" style="' + imgStyle + '" />';
    return '<h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:bold;letter-spacing:3px;font-family:Arial,sans-serif;">NEXG</h1>';
  },

  renderSubject: function (templateKey, data) {
    const templateDef = EmailTemplates.get(templateKey);
    if (!templateDef) return 'NEXG Notification';
    let subject = templateDef.subject || '';
    data = data || {};
    Object.keys(data).forEach(function (key) {
      const regex = new RegExp('{{' + key + '}}', 'g');
      const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
      subject = subject.replace(regex, function () { return value; });
    });
    return subject;
  }
};