/**
 * NEXG CRM
 * Contract 3 Phase 2 — Extended Workflows & Controllers
 * File: 23_Phase2.gs
 * Routes resolve dynamically, so these join workflow.* / panel.* automatically.
 */

var NEXG = NEXG || {};

NEXG.ONBOARDING_STEPS = ['Photography', 'Inspection', 'Branding', 'Training', 'Listing', 'GoLive'];

/* ---------------- Meeting reschedule ---------------- */

NEXG.Workflows.rescheduleMeeting = function(payload) {
  NEXG.Security.requirePermission('meeting.edit');
  payload = payload || {};

  var found = NEXG.Workflows._meetings().findById(payload.meetingId);
  if (!found.success) NEXG.throwError('MEETING_NOT_FOUND', 'Meeting not found.');
  if (!payload.scheduledAt) NEXG.throwError('VALIDATION_ERROR', 'New time is required.');

  var m = found.data.record;

  NEXG.Workflows._meetings().update(m.meetingId, {
    status: 'Rescheduled',
    scheduledAt: new Date(payload.scheduledAt),
    location: payload.location || m.location || ''
  });

  NEXG.Workflows._log('meeting.rescheduled', m.hostId, 'Meeting rescheduled: ' + m.title, '', {
    metadataJson: { meetingId: m.meetingId }
  });

  NEXG.EventBus.publish('workflow.meetingRescheduled', { hostId: m.hostId });
  return NEXG.ok({ meetingId: m.meetingId });
};

/* ---------------- Onboarding queue ---------------- */

NEXG.Workflows.scheduleOnboardingStep = function(payload) {
  NEXG.Security.requirePermission('activity.create');
  payload = payload || {};
  var host = NEXG.Workflows._requireHost(payload.hostId);

  if (NEXG.ONBOARDING_STEPS.indexOf(payload.step) === -1) {
    NEXG.throwError('VALIDATION_ERROR', 'Invalid onboarding step.');
  }

  var act = NEXG.Workflows._activities().create({
    hostId: host.hostId,
    type: 'onboarding.' + String(payload.step).toLowerCase(),
    status: 'Scheduled',
    subject: payload.step,
    notes: payload.notes || '',
    dueAt: payload.dueAt ? new Date(payload.dueAt) : ''
  });

  NEXG.EventBus.publish('workflow.onboardingScheduled', { hostId: host.hostId, step: payload.step });
  return NEXG.ok({ activity: act.data.record });
};

NEXG.Workflows.completeOnboardingStep = function(payload) {
  NEXG.Security.requirePermission('activity.create');
  payload = payload || {};

  var found = NEXG.Workflows._activities().findById(payload.activityId);
  if (!found.success) NEXG.throwError('STEP_NOT_FOUND', 'Onboarding step not found.');

  var a = found.data.record;

  NEXG.Workflows._activities().update(a.activityId, {
    status: 'Completed',
    completedAt: new Date(),
    outcome: payload.notes || 'Completed'
  });

  NEXG.Workflows._log(String(a.subject).toLowerCase() + '.completed', a.hostId, a.subject + ' completed', payload.notes || '');

  NEXG.EventBus.publish('workflow.onboardingCompleted', { hostId: a.hostId, step: a.subject });
  return NEXG.ok({ activityId: a.activityId });
};

/* ---------------- Email engagement ---------------- */

NEXG.Workflows.markEmailEngagement = function(payload) {
  NEXG.Security.requirePermission('email.edit');
  payload = payload || {};

  var found = NEXG.Workflows._emails().findById(payload.emailLogId);
  if (!found.success) NEXG.throwError('EMAIL_NOT_FOUND', 'Email not found.');

  var now = new Date();
  var updates = {};

  if (payload.event === 'opened') updates.openedAt = now;
  if (payload.event === 'clicked') updates.clickedAt = now;
  if (payload.event === 'replied') { updates.repliedAt = now; updates.status = 'Replied'; }

  NEXG.Workflows._emails().update(payload.emailLogId, updates);
  NEXG.Workflows._log('email.' + payload.event, found.data.record.hostId, 'Email ' + payload.event, '');

  NEXG.EventBus.publish('workflow.emailEngagement', { emailLogId: payload.emailLogId, event: payload.event });
  return NEXG.ok({});
};

/* ---------------- Pinned searches ---------------- */

NEXG.Workflows.pinSearch = function(payload) {
  NEXG.Security.requirePermission('panel.use');
  var q = String((payload || {}).query || '').trim();
  if (!q) NEXG.throwError('VALIDATION_ERROR', 'Query required.');
  NEXG.Migrations.upsertSetting('pinnedSearch', q, { query: q, by: NEXG.Security.getCurrentUserEmail() });
  return NEXG.ok({ query: q });
};

NEXG.Workflows.unpinSearch = function(payload) {
  NEXG.Security.requirePermission('panel.use');
  var rec = NEXG.Migrations.findSettingRecord('pinnedSearch', String((payload || {}).query || ''));
  if (rec) NEXG.getRepository('Settings').archive(rec.settingId);
  return NEXG.ok({});
};

/* ---------------- Controllers ---------------- */

NEXG.SmartPanel.getOnboarding = function() {
  return NEXG.Cache.get('onb', 60, function() {
    return NEXG.SmartPanel.getOnboardingUncached();
  });
};

NEXG.SmartPanel.getOnboardingUncached = function() {
  try {
    NEXG.Security.requirePermission('activity.view');
    var acts = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var open = acts.filter(function(a) { return a.type.indexOf('onboarding.') === 0 && a.status === 'Scheduled'; });
    open.sort(function(a, b) { return String(a.dueAt || '9999').localeCompare(String(b.dueAt || '9999')); });
    return NEXG.ok({ steps: open.slice(0, 30) });
  } catch (err) {
    return NEXG.fail('ONBOARDING_FAILED', err.message);
  }
};

NEXG.SmartPanel.getPinned = function() {
  var recs = NEXG.Migrations.findSettingsByCategory('pinnedSearch');
  return NEXG.ok({
    pinned: recs.filter(function(r) { return r.active !== false; }).map(function(r) { return r.key; })
  });
};

/* Enhanced insights: funnel + email analytics */
NEXG.SmartPanel.getInsights = function() {
  return NEXG.Cache.get('ins', 60, function() {
    return NEXG.SmartPanel.getInsightsUncached();
  });
};

NEXG.SmartPanel.getInsightsUncached = function() {
  try {
    NEXG.Security.requirePermission('dashboard.view');

    var hosts = NEXG.getRepository('Hosts').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var acts = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var emails = NEXG.getRepository('EmailLogs').search('', { limit: 500, rawLimit: 500 }).data.records || [];

    var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    var counts = {};
    hosts.forEach(function(h) { var s = h.stage || 'lead'; counts[s] = (counts[s] || 0) + 1; });

    var weekActs = acts.filter(function(a) { return a.createdAt && new Date(a.createdAt) >= weekAgo; });

    return NEXG.ok({
      totals: {
        hosts: hosts.length,
        live: counts['live'] || 0,
        callsThisWeek: weekActs.filter(function(a) { return a.type === 'call.logged'; }).length,
        meetingsThisWeek: weekActs.filter(function(a) { return a.type === 'meeting.completed'; }).length,
        emailsSent: emails.filter(function(e) { return e.status === 'Sent' || e.status === 'Replied'; }).length,
        emailsOpened: emails.filter(function(e) { return e.openedAt; }).length,
        emailsReplied: emails.filter(function(e) { return e.repliedAt; }).length,
        conversion: hosts.length ? Math.round(((counts['live'] || 0) / hosts.length) * 100) : 0
      },
      stageCounts: counts
    });
  } catch (err) {
    return NEXG.fail('INSIGHTS_FAILED', err.message);
  }
};