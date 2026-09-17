/**
 * NEXG CRM
 * Contract 4 — Email Template Library (single source of truth)
 * File: 26_EmailTemplates.gs
 *
 * Purpose:
 * - Host-flavored templates with {{variables}}, mirroring the merchant
 *   EmailTemplates registry (subject + html + variables list).
 * - NEXG.EmailTemplates.render(key, data) merges + HTML-escapes values
 *   (sheet data must never inject markup into email HTML).
 * - The engine resolves templates at SEND time; enqueue validates early.
 */

var NEXG = NEXG || {};

NEXG.EmailTemplates = (function() {

  var S = {
    GREET: 'margin:0 0 18px 0;font-size:16px;color:#333333;font-family:Arial,sans-serif;',
    P: 'margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#333333;font-family:Arial,sans-serif;',
    BOX: 'background-color:#faf7ef;border-left:4px solid #D4AF37;border-radius:4px;margin:0 0 22px 0;',
    BOXPAD: 'padding:18px 20px;',
    H2: 'margin:0 0 12px 0;font-size:17px;color:#8a6d1c;font-weight:bold;font-family:Arial,sans-serif;',
    ROW: 'margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#555555;font-family:Arial,sans-serif;',
    ROWLAST: 'margin:0;font-size:15px;line-height:1.6;color:#555555;font-family:Arial,sans-serif;',
    LBL: 'color:#333333;',
    SIGN: 'margin:24px 0 0 0;font-size:15px;line-height:1.6;color:#333333;font-family:Arial,sans-serif;'
  };

  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var H = {
    greet: function(v) { return '<p style="' + S.GREET + '">Hi ' + v + ',</p>'; },
    p: function(html) { return '<p style="' + S.P + '">' + html + '</p>'; },
    card: function(title, rows) {
      var inner = title ? '<h2 style="' + S.H2 + '">' + title + '</h2>' : '';
      rows.forEach(function(r, i) {
        var lab = r[0] ? '<strong style="' + S.LBL + '">' + r[0] + ':</strong> ' : '';
        inner += '<p style="' + (i === rows.length - 1 ? S.ROWLAST : S.ROW) + '">' + lab + r[1] + '</p>';
      });
      return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="' + S.BOX + 'border-collapse:collapse;"><tr><td style="' + S.BOXPAD + '">' + inner + '</td></tr></table>';
    },
    callout: function(title, html) {
      return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="' + S.BOX + 'border-collapse:collapse;"><tr><td style="' + S.BOXPAD + '"><h2 style="' + S.H2 + '">' + title + '</h2><p style="' + S.ROWLAST + '">' + html + '</p></td></tr></table>';
    },
    sign: function(rep) {
      var s = '<p style="' + S.SIGN + '">Regards,<br><strong>' + (rep || 'NEXG Team') + '</strong><br>NEXG Host Acquisition</p>';
      return s;
    }
  };

  var registry = {
    INTRODUCTION: {
      subject: 'Introduction to NEXG',
      variables: ['contact_person', 'host_name', 'property_name', 'next_step', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('It was a pleasure connecting with you.') +
        H.p('I\u2019m reaching out on behalf of NEXG to formally introduce our platform and explore how we could work with <strong>{{host_name}}</strong>{{property_line}}.') +
        H.p('NEXG turns outstanding properties into fully managed, guest-ready stays \u2014 from listings and pricing to cleaning, guest messaging and payouts.') +
        H.callout('What happens next', '{{next_step}}') +
        H.p('Please feel free to reply to this email directly with any questions.') +
        H.sign('{{sales_rep}}')
    },
    MEETING_CONFIRMATION: {
      subject: 'Meeting Confirmed \u2014 NEXG \u00D7 {{host_name}}',
      variables: ['contact_person', 'host_name', 'meeting_date', 'meeting_time', 'meeting_type', 'meeting_purpose', 'sales_rep', 'meeting_location'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Thank you for arranging time with us. Your meeting with NEXG has been confirmed.') +
        H.card('Meeting Details', [
          ['Date', '{{meeting_date}}'], ['Time', '{{meeting_time}}'], ['Format', '{{meeting_type}}'],
          ['Purpose', '{{meeting_purpose}}'], ['Your NEXG Representative', '{{sales_rep}}']
        ]) +
        H.p('We\u2019re looking forward to learning more about <strong>{{host_name}}</strong>.') +
        H.p('{{meeting_location}}') +
        H.sign('{{sales_rep}}')
    },
    MEETING_REMINDER: {
      subject: 'Reminder: NEXG Meeting Tomorrow',
      variables: ['contact_person', 'meeting_date', 'meeting_time', 'meeting_type', 'meeting_purpose', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Just a quick reminder that your meeting with NEXG is scheduled for:') +
        H.card(null, [['', '<strong>{{meeting_date}} \u00B7 {{meeting_time}}</strong>'], ['', '{{meeting_type}}']]) +
        H.p('We\u2019ll be discussing:') +
        H.p('{{meeting_purpose}}') +
        H.p('Your NEXG representative will be <strong>{{sales_rep}}</strong>. We look forward to speaking with you.') +
        H.sign(null)
    },
    MEETING_RECAP: {
      subject: 'Thank You \u2014 {{host_name}} \u00D7 NEXG',
      variables: ['contact_person', 'host_name', 'meeting_summary', 'next_steps', 'follow_up_date', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Thank you for taking the time to meet with us about <strong>{{host_name}}</strong>.') +
        H.callout('Meeting Summary', '{{meeting_summary}}') +
        H.callout('Agreed Next Steps', '{{next_steps}}') +
        H.card(null, [['Next Follow-Up', '{{follow_up_date}}']]) +
        H.p('We\u2019ll follow up as agreed \u2014 reply any time with questions.') +
        H.sign('{{sales_rep}}')
    },
    FOLLOW_UP: {
      subject: 'Following Up \u2014 NEXG \u00D7 {{host_name}}',
      variables: ['contact_person', 'host_name', 'follow_up_message', 'next_action', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Circling back on our conversation about <strong>{{host_name}}</strong>.') +
        H.p('{{follow_up_message}}') +
        H.callout('Suggested next step', '{{next_action}}') +
        H.sign('{{sales_rep}}')
    },
    PROPOSAL: {
      subject: 'Your NEXG Proposal \u2014 {{property_name}}',
      variables: ['contact_person', 'host_name', 'property_name', 'proposal_summary', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('As discussed, here is the commercial picture for bringing <strong>{{property_name}}</strong> onto NEXG.') +
        H.callout('Proposal Summary', '{{proposal_summary}}') +
        H.p('Happy to walk through any line item on a call \u2014 just reply with a time that suits you.') +
        H.sign('{{sales_rep}}')
    },
    CONTRACT: {
      subject: 'Your NEXG Partnership Agreement',
      variables: ['contact_person', 'host_name', 'contract_id', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Please find attached/linked your partnership agreement for <strong>{{host_name}}</strong>.') +
        H.card(null, [['Agreement Reference', '{{contract_id}}']]) +
        H.p('Once signed, our onboarding team takes over: photography, inspection, branding and listing \u2014 you just approve each step.') +
        H.sign('{{sales_rep}}')
    },
    CONTRACT_SIGNED: {
      subject: 'Welcome to NEXG!',
      variables: ['contact_person', 'host_name', 'property_name', 'onboarding_next_step', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('Wonderful news \u2014 <strong>{{property_name}}</strong> is officially joining the NEXG network. Welcome aboard!') +
        H.callout('What happens now', '{{onboarding_next_step}}') +
        H.sign('{{sales_rep}}')
    },
    ONBOARDING: {
      subject: 'Next Step: {{onboarding_step}} \u2014 {{property_name}}',
      variables: ['contact_person', 'property_name', 'onboarding_step', 'due_note', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('A quick update on getting <strong>{{property_name}}</strong> guest-ready.') +
        H.card('Onboarding Step', [['Step', '{{onboarding_step}}'], ['Note', '{{due_note}}']]) +
        H.sign('{{sales_rep}}')
    },
    GO_LIVE: {
      subject: '{{property_name}} is Live on NEXG!',
      variables: ['contact_person', 'host_name', 'property_name', 'go_live_date', 'sales_rep'],
      html:
        H.greet('{{contact_person}}') +
        H.p('It\u2019s official \u2014 <strong>{{property_name}}</strong> went live on <strong>{{go_live_date}}</strong> and is now bookable.') +
        H.p('Our team is watching the first bookings closely. Here\u2019s to full calendars, {{contact_person}}!') +
        H.sign('{{sales_rep}}')
    }
  };

  function merge(text, data) {
    var out = String(text || '');
    Object.keys(data || {}).forEach(function(key) {
      var re = new RegExp('{{' + key + '}}', 'g');
      var value = data[key] === null || data[key] === undefined ? '' : String(data[key]);
      out = out.replace(re, function() { return value; });
    });
    return out;
  }

  return {
    keys: function() { return Object.keys(registry); },

    get: function(templateKey) {
      var k = String(templateKey || '').trim().toUpperCase();
      return registry[k] || null;
    },

    variables: function(templateKey) {
      var def = this.get(templateKey);
      return def ? def.variables.slice() : [];
    },

    /**
     * Panel-facing catalog: [{ key, label, variables: [{key,label}] }].
     * Labels are humanized from variable keys — single source with validation.
     */
    list: function() {
      var self = this;
      return Object.keys(registry).map(function(key) {
        var pretty = key.toLowerCase().split('_').map(function(w) {
          return w.charAt(0).toUpperCase() + w.slice(1);
        }).join(' ');
        return {
          key: key,
          label: pretty,
          variables: self.variables(key).map(function(v) {
            return {
              key: v,
              label: v.split('_').map(function(w) {
                return w.charAt(0).toUpperCase() + w.slice(1);
              }).join(' ')
            };
          })
        };
      });
    },

    /**
     * Renders subject + HTML body. Values are HTML-escaped so sheet data
     * can never inject markup; unknown placeholders are tidied away.
     */
    render: function(templateKey, data) {
      var def = this.get(templateKey);
      if (!def) NEXG.throwError('TEMPLATE_NOT_FOUND', 'Unknown email template: ' + templateKey);
      data = data || {};
      var safe = {};
      Object.keys(data).forEach(function(key) { safe[key] = esc(data[key]); });
      // property_line is derived, not user data — build unescaped on purpose.
      if (!safe.property_line && safe.property_name) {
        safe.property_line = ' and your property <strong>' + safe.property_name + '</strong>';
      } else if (!safe.property_line) {
        safe.property_line = '';
      }
      var subject = merge(def.subject, data);
      var body = merge(def.html, safe);
      body = body.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '');
      subject = subject.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '').trim();
      return { subject: subject, body: body };
    }
  };
})();
