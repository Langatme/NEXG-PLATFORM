/*************************************************************
* NEXG EMAIL — CALENDAR SERVICE
* File: EmailCalendar.gs (NEW FILE)
*
* Turns meeting_date / meeting_time merge data into:
*  • "Add to Google Calendar" / Outlook / Yahoo links
*  • an attached NEXG-Meeting.ics file (any calendar app)
* All of them carry a short description (purpose, rep, location).
*************************************************************/
const EmailCalendar = {
  hasEvent: function (data) { return !!this.parseWhen_(data); },

  parseWhen_: function (data) {
    data = data || {};
    var dateStr = String(data.meeting_date || '').trim();
    if (!dateStr) return null;
    var timeStr = String(data.meeting_time || '').trim()
      .replace(/\s*(EAT|CAT|WAT|UTC|GMT([+-]\d{1,2})?)\s*$/i, '');
    var start = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      start = new Date(dateStr + 'T' + (timeStr || '10:00') + ':00');
    } else {
      start = new Date(dateStr + ' ' + (timeStr || '10:00'));
    }
    if (!start || isNaN(start.getTime())) return null;
    var dur = parseInt(data.meeting_duration_minutes, 10) || 60;
    return { start: start, end: new Date(start.getTime() + dur * 60000) };
  },

  title_: function (data) { return 'NEXG × ' + (data.business_name || 'Meeting'); },

  description_: function (data) {
    var parts = [];
    if (data.meeting_purpose) parts.push('Purpose: ' + data.meeting_purpose);
    if (data.meeting_type) parts.push('Format: ' + data.meeting_type);
    if (data.sales_rep) parts.push('NEXG representative: ' + data.sales_rep);
    if (data.meeting_location_or_link) parts.push(String(data.meeting_location_or_link));
    parts.push('Sent from the NEXG Email Control Center.');
    return parts.join('\n');
  },

  location_: function (data) {
    return String(data.meeting_location_or_link || '').replace(/^Join the call:\s*/i, '') || 'NEXG';
  },

  fmtUtc_: function (d) { return Utilities.formatDate(d, 'UTC', "yyyyMMdd'T'HHmmss'Z'"); },
  fmtLocal_: function (d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"); },
  enc_: function (s) { return encodeURIComponent(String(s == null ? '' : s)); },
  icsEsc_: function (s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  },

  googleUrl: function (data) {
    var w = this.parseWhen_(data); if (!w) return '';
    return 'https://calendar.google.com/calendar/render?' + [
      'action=TEMPLATE',
      'text=' + this.enc_(this.title_(data)),
      'dates=' + this.fmtUtc_(w.start) + '/' + this.fmtUtc_(w.end),
      'details=' + this.enc_(this.description_(data)),
      'location=' + this.enc_(this.location_(data)),
      'ctz=Africa/Nairobi'
    ].join('&');
  },

  outlookUrl: function (data) {
    var w = this.parseWhen_(data); if (!w) return '';
    return 'https://outlook.live.com/calendar/0/deeplink/compose?' + [
      'path=/calendar/action/compose', 'rru=addevent',
      'subject=' + this.enc_(this.title_(data)),
      'startdt=' + this.enc_(this.fmtLocal_(w.start)),
      'enddt=' + this.enc_(this.fmtLocal_(w.end)),
      'body=' + this.enc_(this.description_(data)),
      'location=' + this.enc_(this.location_(data))
    ].join('&');
  },

  yahooUrl: function (data) {
    var w = this.parseWhen_(data); if (!w) return '';
    return 'https://calendar.yahoo.com/?' + [
      'v=60', 'view=d', 'type=20',
      'title=' + this.enc_(this.title_(data)),
      'st=' + this.fmtUtc_(w.start), 'dur=0100',
      'desc=' + this.enc_(this.description_(data)),
      'in_loc=' + this.enc_(this.location_(data))
    ].join('&');
  },

  buildIcs: function (data) {
    var w = this.parseWhen_(data); if (!w) return '';
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//NEXG//Email Control Center//EN',
      'CALSCALE:GREGIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Utilities.getUuid() + '@nexg',
      'DTSTAMP:' + this.fmtUtc_(new Date()),
      'DTSTART:' + this.fmtUtc_(w.start),
      'DTEND:' + this.fmtUtc_(w.end),
      'SUMMARY:' + this.icsEsc_(this.title_(data)),
      'DESCRIPTION:' + this.icsEsc_(this.description_(data)),
      'LOCATION:' + this.icsEsc_(this.location_(data)),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
  },

  icsBlob: function (data) {
    var ics = this.buildIcs(data);
    if (!ics) return null;
    return Utilities.newBlob(ics, 'text/calendar', 'NEXG-Meeting.ics');
  },

  /** HTML button row injected as {{calendar_block}} */
  blockFor: function (data) {
    var w = this.parseWhen_(data);
    if (!w) return '';
    var btn = function (label, url, bg) {
      return '<td align="center" style="padding:0 5px;">' +
        '<a href="' + url + '" target="_blank" style="display:inline-block;padding:11px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;background-color:' + bg + ';">' + label + '</a></td>';
    };
    return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;border-collapse:collapse;">' +
      '<tr><td style="padding:0 0 10px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#1c1c1e;">Add this meeting to your calendar</td></tr>' +
      '<tr>' +
      btn('Google Calendar', this.googleUrl(data), '#1c1c1e') +
      btn('Outlook', this.outlookUrl(data), '#004aad') +
      btn('Yahoo', this.yahooUrl(data), '#5f27b1') +
      '</tr>' +
      '<tr><td style="padding:9px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#888888;">Apple Calendar or another app? Open the <strong>NEXG-Meeting.ics</strong> file attached to this email.</td></tr>' +
      '</table>';
  }
};