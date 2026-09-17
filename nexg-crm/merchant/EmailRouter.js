/*************************************************************
* NEXG EMAIL — EVENT ROUTER
* File: EmailRouter.gs
*
* Maps Smart Panel events to email templates and queues them.
* Called by SheetData.gs via triggerEmailAutomation_().
*************************************************************/
const EmailRouter = {
  trigger: function (eventName, merchantId, payload) {
    payload = payload || {};
    if (!payload.sendEmail) return { skipped: 'sendEmail not requested' };

    const profile = getMerchantProfileForPanel(merchantId);
    if (!profile || !profile.merchant) return { skipped: 'merchant not found' };
    const m = profile.merchant;

    const email = String(m.email || '').trim();
    if (!EmailConfig.isEmail_(email)) return { skipped: 'merchant has no valid email (' + merchantId + ')' };

    const action = String(eventName || '').toLowerCase();
    if (action === 'meeting')    return this.queueMeeting_(m, payload);
    if (action === 'proposal')   return this.queueProposal_(m, payload);
    if (action === 'contract')   return payload.signed ? this.queueContractSigned_(m, payload) : this.queueContract_(m, payload);
    if (action === 'live')       return this.queueGoLive_(m, payload);
    if (action === 'onboarding') return this.queueOnboarding_(m, payload);
    return { skipped: 'no email mapping for event: ' + eventName };
  },

  /* ── helpers ─────────────────────────────────────────────── */
  when_: function (dateStr, timeStr) {
    const d = dateStr ? new Date(dateStr + 'T' + (timeStr || '10:00') + ':00') : new Date();
    return (!d || isNaN(d.getTime())) ? new Date() : d;
  },
  fmtDate_: function (d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMMM d, yyyy'); },
  fmtTime_: function (d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'h:mm a'); },
  meta_: function (m, event) { return { merchantId: m.id, source: 'smart_panel', event: event }; },

  /* ── MEETING → confirmation now + reminder 24h before ────── */
  queueMeeting_: function (m, p) {
    const start = this.when_(p.meetingDate, p.meetingTime);
    const data = {
      contact_person: p.contactPerson || m.contactPerson || 'there',
      business_name: m.businessName,
      meeting_date: this.fmtDate_(start),
      meeting_time: this.fmtTime_(start),
      meeting_type: p.meetingType || 'Meeting',
      meeting_purpose: p.notes || 'Discuss your NEXG integration and next steps.',
      sales_rep: m.salesRep,
      meeting_location_or_link: p.meetingLink || (String(p.meetingType) === 'Virtual' ? 'Meet link to follow' : 'NEXG offices'),
      cta_link: ''
    };
    const queued = [EmailQueue.enqueue('MEETING_CONFIRMATION', m.email, data, this.meta_(m, 'Meeting'))];

    const reminderAt = new Date(start.getTime() - 24 * 3600000);
    if (reminderAt > new Date()) {
      queued.push(EmailQueue.enqueue('MEETING_REMINDER', m.email, data, this.meta_(m, 'Meeting.reminder'), reminderAt));
    }
    return { queued: queued };
  },

  /* ── PROPOSAL ────────────────────────────────────────────── */
  queueProposal_: function (m, p) {
    const data = {
      contact_person: m.contactPerson || 'there',
      business_name: m.businessName,
      proposal_date: this.fmtDate_(this.when_(p.proposalDate, null)),
      proposal_reference: p.proposalReference || ('NEXG-PR-' + new Date().getFullYear()),
      proposal_summary: p.proposalNotes || ('Proposed value: KSH ' + (p.proposalValue || 'TBC') + '. Happy to walk through any line item.'),
      sales_rep: m.salesRep,
      cta_link: ''
    };
    return { queued: [EmailQueue.enqueue('PROPOSAL', m.email, data, this.meta_(m, 'Proposal'))] };
  },

  /* ── CONTRACT (not signed yet) ───────────────────────────── */
  queueContract_: function (m, p) {
    const data = {
      contact_person: m.contactPerson || 'there',
      contract_id: p.contractId || ('NEXG-AGR-' + new Date().getFullYear()),
      sales_rep: m.salesRep,
      cta_link: ''
    };
    return { queued: [EmailQueue.enqueue('CONTRACT', m.email, data, this.meta_(m, 'Contract'))] };
  },

  /* ── CONTRACT SIGNED → welcome ───────────────────────────── */
  queueContractSigned_: function (m, p) {
    const data = {
      contact_person: m.contactPerson || 'there',
      business_name: m.businessName,
      onboarding_next_step: 'Your welcome pack, document checklist and onboarding timeline arrive within one business day.',
      sales_rep: m.salesRep
    };
    return { queued: [EmailQueue.enqueue('CONTRACT_SIGNED', m.email, data, this.meta_(m, 'Contract.signed'))] };
  },

  /* ── ONBOARDING update ───────────────────────────────────── */
  queueOnboarding_: function (m, p) {
    const yn = function (v) { return String(v || '').toUpperCase() === 'YES' ? 'Completed' : 'In progress'; };
    const data = {
      contact_person: m.contactPerson || 'there',
      business_name: m.businessName,
      documents_status: yn(p.documents),
      training_status: yn(p.training),
      system_status: yn(p.system),
      launch_status: yn(p.signage),
      sales_rep: m.salesRep,
      cta_link: ''
    };
    return { queued: [EmailQueue.enqueue('ONBOARDING', m.email, data, this.meta_(m, 'Onboarding'))] };
  },

  /* ── GO LIVE 🎉 ──────────────────────────────────────────── */
  queueGoLive_: function (m, p) {
    const data = {
      contact_person: m.contactPerson || 'there',
      business_name: m.businessName,
      go_live_date: this.fmtDate_(this.when_(p.liveDate, null)),
      first_steps: p.liveNotes || 'Log in • Confirm opening details • Reach out with your first question.',
      sales_rep: m.salesRep,
      cta_link: ''
    };
    return { queued: [EmailQueue.enqueue('GO_LIVE', m.email, data, this.meta_(m, 'Live'))] };
  }
};