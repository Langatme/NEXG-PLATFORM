/*************************************************************
 * NEXG EMAIL — TEMPLATE LIBRARY (single source of truth)
 * File: EmailTemplates.gs
 *************************************************************/

const S = {
  GREET: 'margin:0 0 18px 0;font-size:16px;color:#333333;font-family:Arial,sans-serif;',
  P: 'margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#333333;font-family:Arial,sans-serif;',
  BOX: 'background-color:#f8f9fa;border-left:4px solid #004aad;border-radius:4px;margin:0 0 22px 0;',
  BOXPAD: 'padding:18px 20px;',
  H2: 'margin:0 0 12px 0;font-size:17px;color:#004aad;font-weight:bold;font-family:Arial,sans-serif;',
  ROW: 'margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#555555;font-family:Arial,sans-serif;',
  ROWLAST: 'margin:0;font-size:15px;line-height:1.6;color:#555555;font-family:Arial,sans-serif;',
  LBL: 'color:#333333;',
  SIGN: 'margin:24px 0 0 0;font-size:15px;line-height:1.6;color:#333333;font-family:Arial,sans-serif;'
};

const T = {
  greet: function (v) { return '<p style="' + S.GREET + '">Hi ' + v + ',</p>'; },
  p: function (html) { return '<p style="' + S.P + '">' + html + '</p>'; },
  card: function (title, rows) {
    var inner = title ? '<h2 style="' + S.H2 + '">' + title + '</h2>' : '';
    rows.forEach(function (r, i) {
      var lab = r[0] ? '<strong style="' + S.LBL + '">' + r[0] + ':</strong> ' : '';
      inner += '<p style="' + (i === rows.length - 1 ? S.ROWLAST : S.ROW) + '">' + lab + r[1] + '</p>';
    });
    return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="' + S.BOX + 'border-collapse:collapse;"><tr><td style="' + S.BOXPAD + '">' + inner + '</td></tr></table>';
  },
  callout: function (title, html) {
    return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="' + S.BOX + 'border-collapse:collapse;"><tr><td style="' + S.BOXPAD + '"><h2 style="' + S.H2 + '">' + title + '</h2><p style="' + S.ROWLAST + '">' + html + '</p></td></tr></table>';
  },
  cta: function () { return '{{cta_block}}'; },
  cal: function () { return '{{calendar_block}}'; },
  sign: function (rep, team, emailVar) {
    if (team) return '<p style="' + S.SIGN + '">Regards,<br><strong>NEXG Team</strong></p>';
    var s = '<p style="' + S.SIGN + '">Regards,<br><strong>' + rep + '</strong><br>NEXG';
    if (emailVar) s += '<br><span style="color:#888888;font-size:13px;">' + emailVar + '</span>';
    return s + '</p>';
  }
};

const EmailTemplates = {
  groups: ['SALES', 'ONBOARDING', 'RELATIONSHIP'],

  registry: {
    INTRODUCTION: {
      group: 'SALES', ctaLabel: 'Schedule a Conversation',
      subject: 'Introduction to NEXG',
      variables: ['contact_person', 'business_name', 'next_step', 'sales_rep', 'sales_rep_email', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('It was a pleasure connecting with you.') +
        T.p('I\u2019m reaching out on behalf of NEXG to formally introduce our platform and explore how we could work with <strong>{{business_name}}</strong>.') +
        T.p('NEXG helps businesses streamline their operations, customer experience, and service delivery through a connected digital platform. Based on our conversation, we believe there may be a strong opportunity to work together.') +
        T.callout('What happens next', '{{next_step}}') +
        T.p('Please feel free to reply to this email directly if you have any questions.') +
        T.cta() +
        T.sign('{{sales_rep}}', false, '{{sales_rep_email}}')
    },
    MEETING_CONFIRMATION: {
      group: 'SALES', ctaLabel: 'View Meeting Details',
      subject: 'Meeting Confirmed \u2014 NEXG \u00D7 {{business_name}}',
      variables: ['contact_person', 'business_name', 'meeting_date', 'meeting_time', 'meeting_type', 'meeting_purpose', 'sales_rep', 'meeting_location_or_link', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Thank you for arranging time with us. Your meeting with NEXG has been confirmed.') +
        T.card('Meeting Details', [
          ['Date', '{{meeting_date}}'], ['Time', '{{meeting_time}}'], ['Format', '{{meeting_type}}'],
          ['Purpose', '{{meeting_purpose}}'], ['Your NEXG Representative', '{{sales_rep}}']
        ]) +
        T.p('We\u2019re looking forward to speaking with you and learning more about <strong>{{business_name}}</strong>.') +
        T.p('{{meeting_location_or_link}}') +
        T.cal() +
        T.cta() +
        T.sign('{{sales_rep}}', false)
    },
    MEETING_REMINDER: {
      group: 'SALES', ctaLabel: 'View Meeting',
      subject: 'Reminder: NEXG Meeting Tomorrow',
      variables: ['contact_person', 'meeting_date', 'meeting_time', 'meeting_type', 'meeting_purpose', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Just a quick reminder that your meeting with NEXG is scheduled for:') +
        T.card(null, [['', '<strong>{{meeting_date}} \u00B7 {{meeting_time}}</strong>'], ['', '{{meeting_type}}']]) +
        T.p('We\u2019ll be discussing:') +
        T.p('{{meeting_purpose}}') +
        T.p('Your NEXG representative will be <strong>{{sales_rep}}</strong>. We look forward to speaking with you.') +
        T.cal() +
        T.cta() +
        T.sign(null, true)
    },
    MEETING_RECAP: {
      group: 'SALES', ctaLabel: 'Continue the Conversation',
      subject: 'Thank You \u2014 {{business_name}} \u00D7 NEXG',
      variables: ['contact_person', 'business_name', 'meeting_summary', 'discussion_points', 'next_steps', 'follow_up_date', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Thank you for taking the time to meet with us. We appreciated the opportunity to learn more about <strong>{{business_name}}</strong> and discuss how NEXG could support your business.') +
        T.callout('Our Discussion', '{{meeting_summary}}') +
        T.callout('Key Points', '{{discussion_points}}') +
        T.callout('Agreed Next Steps', '{{next_steps}}') +
        T.card(null, [['Next Follow-Up', '{{follow_up_date}}']]) +
        T.p('We\u2019ll follow up as agreed, and please feel free to reach out in the meantime if there is anything you would like us to clarify.') +
        T.cta() +
        T.sign('{{sales_rep}}', false)
    },
    FOLLOW_UP: {
      group: 'SALES',
      subject: 'Following Up \u2014 NEXG \u00D7 {{business_name}}',
      variables: ['contact_person', 'business_name', 'follow_up_message', 'next_action', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('I wanted to follow up regarding our recent conversation about NEXG.') +
        T.p('{{follow_up_message}}') +
        T.p('We\u2019d be happy to answer any questions, provide additional information, or discuss the next steps with you.') +
        T.callout('Next Step', '{{next_action}}') +
        T.p('Please let me know what works best for you.') +
        T.sign('{{sales_rep}}', false)
    },
    PROPOSAL: {
      group: 'SALES', ctaLabel: 'Review Proposal',
      subject: 'NEXG Proposal \u2014 {{business_name}}',
      variables: ['contact_person', 'business_name', 'proposal_date', 'proposal_reference', 'proposal_summary', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Thank you for the opportunity to work with <strong>{{business_name}}</strong>. As discussed, we\u2019ve prepared a proposal outlining how NEXG can support your business.') +
        T.card('Proposal', [['Prepared for', '{{business_name}}'], ['Date', '{{proposal_date}}'], ['Reference', '{{proposal_reference}}']]) +
        T.callout('Summary', '{{proposal_summary}}') +
        T.p('The proposal includes the recommended solution, scope, pricing, and relevant terms for your review. Please take some time to review it, and we\u2019d be happy to walk through any part of it with you.') +
        T.p('We look forward to your feedback.') +
        T.cta() +
        T.sign('{{sales_rep}}', false)
    },
    PROPOSAL_FOLLOW_UP: {
      group: 'SALES',
      subject: 'Following Up on Your NEXG Proposal',
      variables: ['contact_person', 'proposal_reference', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('I wanted to check in regarding the NEXG proposal we shared with you. We\u2019d be happy to answer any questions or make adjustments based on your feedback.') +
        T.card(null, [['Proposal Reference', '{{proposal_reference}}']]) +
        T.p('Please let us know if you\u2019ve had a chance to review it or if there is anything you would like us to clarify.') +
        T.sign('{{sales_rep}}', false)
    },
    TERMS_SUMMARY: {
      group: 'SALES',
      subject: 'Summary of Agreed Terms \u2014 NEXG \u00D7 {{business_name}}',
      variables: ['contact_person', 'business_name', 'agreed_terms', 'open_items', 'next_step', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Thank you for the discussion. To ensure we have a shared understanding, we\u2019ve summarised the key points agreed during our conversation.') +
        T.callout('Agreed Terms', '{{agreed_terms}}') +
        T.callout('Open Items', '{{open_items}}') +
        T.callout('Next Step', '{{next_step}}') +
        T.p('Please review the summary and let us know if anything needs to be clarified or amended. Once confirmed, we\u2019ll proceed with the next stage.') +
        T.sign('{{sales_rep}}', false)
    },
    CONTRACT: {
      group: 'SALES', ctaLabel: 'Review & Sign Agreement',
      subject: 'NEXG Agreement \u2014 Action Required',
      variables: ['contact_person', 'contract_id', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Following our recent discussions, we\u2019ve prepared the NEXG agreement for your review.') +
        T.card(null, [['Agreement Reference', '{{contract_id}}']]) +
        T.p('The agreement outlines the terms, responsibilities, and services we discussed. Please review the document and complete the required signature process.') +
        T.p('If you have any questions regarding the agreement or any of its terms, please contact us and we\u2019ll be happy to assist. Once signed, we\u2019ll proceed with onboarding.') +
        T.cta() +
        T.sign('{{sales_rep}}', false)
    },
    CONTRACT_SIGNED: {
      group: 'ONBOARDING',
      subject: 'Welcome to NEXG \u2014 Agreement Confirmed',
      variables: ['contact_person', 'business_name', 'onboarding_next_step', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('We\u2019re pleased to confirm that the NEXG agreement with <strong>{{business_name}}</strong> has been completed.') +
        T.p('<strong>Welcome to NEXG.</strong>') +
        T.p('Our team will now begin the onboarding process and guide you through the remaining steps required to get your business ready.') +
        T.callout('Next Step', '{{onboarding_next_step}}') +
        T.p('Your NEXG representative, <strong>{{sales_rep}}</strong>, will remain your primary point of contact throughout the process. We\u2019re looking forward to working with you.') +
        T.p('Welcome aboard.') +
        T.sign(null, true)
    },
    ONBOARDING: {
      group: 'ONBOARDING', ctaLabel: 'View Onboarding',
      subject: 'Welcome to NEXG \u2014 Your Onboarding Starts Here',
      variables: ['contact_person', 'business_name', 'documents_status', 'training_status', 'system_status', 'launch_status', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('Welcome to NEXG. We\u2019re excited to begin working with <strong>{{business_name}}</strong>.') +
        T.p('Your onboarding process will guide you through the preparation needed before going live.') +
        T.card('Your Onboarding', [['Documents', '{{documents_status}}'], ['Training', '{{training_status}}'], ['System Setup', '{{system_status}}'], ['Launch Preparation', '{{launch_status}}']]) +
        T.p('Your NEXG representative, <strong>{{sales_rep}}</strong>, will coordinate the process with you. We\u2019ll keep you updated as each milestone is completed.') +
        T.cta() +
        T.sign(null, true)
    },
    ONBOARDING_UPDATE: {
      group: 'ONBOARDING',
      subject: 'NEXG Onboarding Update \u2014 {{business_name}}',
      variables: ['contact_person', 'business_name', 'milestone', 'completed_items', 'next_step', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('We wanted to share a quick update on your NEXG onboarding.') +
        T.callout('Current Progress', '{{milestone}}') +
        T.callout('Completed', '{{completed_items}}') +
        T.callout('Next Step', '{{next_step}}') +
        T.p('Everything is progressing as planned, and we\u2019ll continue to keep you updated.') +
        T.sign('{{sales_rep}}', false)
    },
    GO_LIVE: {
      group: 'ONBOARDING', ctaLabel: 'Get Started',
      subject: '\uD83C\uDF89 {{business_name}} Is Now Live with NEXG',
      variables: ['contact_person', 'business_name', 'go_live_date', 'first_steps', 'sales_rep', 'cta_link'],
      html:
        T.greet('{{contact_person}}') +
        T.p('We\u2019re excited to officially welcome <strong>{{business_name}}</strong> to NEXG. Your business is now live.') +
        T.card(null, [['Go-Live Date', '{{go_live_date}}']]) +
        T.callout('What\u2019s Next', '{{first_steps}}') +
        T.p('Your NEXG representative, <strong>{{sales_rep}}</strong>, will continue to support you as you begin using the platform. If you need assistance at any stage, simply reply to this email and our team will be happy to help.') +
        T.p('Thank you for choosing NEXG. We\u2019re looking forward to what we\u2019ll build together.') +
        T.p('<strong>Welcome to NEXG.</strong>') +
        T.cta() +
        T.sign(null, true)
    },
    RE_ENGAGEMENT: {
      group: 'RELATIONSHIP',
      subject: 'Reconnecting \u2014 NEXG \u00D7 {{business_name}}',
      variables: ['contact_person', 'business_name', 'reengagement_message', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('I hope you\u2019re doing well.') +
        T.p('We spoke previously about NEXG and the opportunity to work with <strong>{{business_name}}</strong>. I wanted to reach out again in case your priorities have changed or the timing is now better to revisit the conversation.') +
        T.p('{{reengagement_message}}') +
        T.p('If it would be useful, I\u2019d be happy to arrange a quick conversation.') +
        T.sign('{{sales_rep}}', false)
    },
    GENERAL: {
      group: 'RELATIONSHIP',
      subject: '{{email_subject}}',
      variables: ['email_subject', 'contact_person', 'business_name', 'message_body', 'sales_rep'],
      html:
        T.greet('{{contact_person}}') +
        T.p('{{message_body}}') +
        T.sign('{{sales_rep}}', false)
    },

        // ─── INTERNAL SYSTEM ALERTS ───────────────────────────────────
    MERCHANT_CREATED: {
      group: 'INTERNAL',
      subject: '🔔 New Merchant Added: {{business_name}}',
      variables: ['business_name', 'main_category', 'sub_category', 'sales_rep', 'lead_source', 'merchant_id'],
      html:
        T.greet('Team') +
        T.p('A new merchant prospect has been added to the NEXG CRM pipeline.') +
        T.card('New Merchant Details', [
          ['Business Name', '{{business_name}}'],
          ['Category', '{{main_category}} › {{sub_category}}'],
          ['Assigned Rep', '{{sales_rep}}'],
          ['Lead Source', '{{lead_source}}'],
          ['Merchant ID', '{{merchant_id}}']
        ]) +
        T.p('The assigned representative will begin the initial outreach sequence.') +
        T.sign(null, true)
    },
    MERCHANT_DELETED: {
      group: 'INTERNAL',
      subject: '🗑️ Merchant Record Removed: {{business_name}}',
      variables: ['business_name', 'merchant_id', 'deleted_by', 'reason'],
      html:
        T.greet('Admin') +
        T.p('A merchant record has been permanently removed from the NEXG CRM.') +
        T.card('Deletion Details', [
          ['Business Name', '{{business_name}}'],
          ['Merchant ID', '{{merchant_id}}'],
          ['Removed By', '{{deleted_by}}'],
          ['Reason', '{{reason}}']
        ]) +
        T.sign(null, true)
    },
    SYSTEM_ALERT: {
      group: 'INTERNAL',
      subject: '⚠️ NEXG System Alert: {{alert_type}}',
      variables: ['alert_type', 'alert_message', 'timestamp'],
      html:
        T.greet('Admin') +
        T.p('The NEXG automated system requires your attention.') +
        T.callout('{{alert_type}}', '{{alert_message}}') +
        T.card('Event Details', [['Timestamp', '{{timestamp}}']]) +
        T.sign(null, true)
    }
    

    
  },

  get: function (templateKey) {
    var k = String(templateKey || '').trim().toUpperCase();
    return this.registry[k] || null;
  },
  list: function () { return Object.keys(this.registry); },
  all: function () {
    return this.list().map(function (key) {
      var d = EmailTemplates.registry[key];
      return { key: key, group: d.group || '', subject: d.subject, variables: d.variables };
    });
  }
};