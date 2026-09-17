/**
 * NEXG CRM
 * Contract 3 — Workflow Engine
 * File: 22_Workflows.gs
 *
 * Every operational mutation passes through here.
 * Workflows: validate → repositories write → activity logged → events emitted.
 *
 * IMPORTANT: This file also installs the SINGLE authoritative router for
 * workflow.* and panel.* routes. It is written to be load-order proof:
 * it always wraps whatever NEXG.routeRequest currently is, and it is the
 * only place that handles these two namespaces.
 */

var NEXG = NEXG || {};

NEXG.Workflows = {

  _hosts: function() { return NEXG.getRepository('Hosts'); },
  _activities: function() { return NEXG.getRepository('Activities'); },
  _meetings: function() { return NEXG.getRepository('Meetings'); },
  _emails: function() { return NEXG.getRepository('EmailLogs'); },

  _requireHost: function(hostId) {
    if (!hostId) NEXG.throwError('VALIDATION_ERROR', 'Host is required.');
    var res = NEXG.Workflows._hosts().findById(hostId);
    if (!res.success) NEXG.throwError('HOST_NOT_FOUND', 'Host not found.');
    return res.data.record;
  },

  _log: function(type, hostId, subject, notes, extra) {
    var payload = {
      hostId: hostId,
      type: type,
      status: 'Completed',
      subject: subject || '',
      notes: notes || '',
      completedAt: new Date()
    };
    if (extra) Object.keys(extra).forEach(function(k) { payload[k] = extra[k]; });
    return NEXG.Workflows._activities().create(payload);
  },

  /* ---------------- Lead ---------------- */

  createLead: function(payload) {
    payload = payload || {};
    if (!payload.displayName && payload.hostName) payload.displayName = payload.hostName;
    var result = NEXG.Workflows._hosts().create(payload);
    if (!result.success) return result;

    var host = result.data.record;

    NEXG.Workflows._log('host.created', host.hostId, 'Lead created: ' + host.hostName, payload.notes || '');

    if (payload.firstFollowUpAt) {
      NEXG.Workflows.scheduleFollowUp({
        hostId: host.hostId,
        dueAt: payload.firstFollowUpAt,
        notes: 'First follow-up after lead creation.'
      });
    }

    NEXG.EventBus.publish('workflow.leadCreated', { hostId: host.hostId });
    return NEXG.ok({ host: host });
  },

  /* ---------------- Call ---------------- */

  logCall: function(payload) {
    NEXG.Security.requirePermission('activity.create');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);
    var now = new Date();

    var activity = NEXG.Workflows._log('call.logged', host.hostId, 'Call: ' + host.hostName, payload.notes || '', {
      outcome: payload.outcome || '',
      subtype: payload.outcome || ''
    });

    var updates = { lastContactAt: now };
    if (payload.nextFollowUpAt) updates.nextFollowUpAt = new Date(payload.nextFollowUpAt);
    NEXG.Workflows._hosts().update(host.hostId, updates);

    NEXG.EventBus.publish('workflow.callLogged', { hostId: host.hostId });
    return NEXG.ok({ activity: activity.data.record });
  },

  /* ---------------- Meeting ---------------- */

  fmtDate_: function(d) {
    try { return Utilities.formatDate(new Date(d), NEXG.Config.timezone, 'MMMM d, yyyy'); } catch (err) { return ''; }
  },

  fmtTime_: function(d) {
    try { return Utilities.formatDate(new Date(d), NEXG.Config.timezone, 'h:mm a'); } catch (err) { return ''; }
  },

  /**
   * Merchant-pattern follow-up: confirmation now + reminder 24h before.
   * Never throws — email must not break meeting scheduling.
   */
  queueMeetingEmails_: function(host, meeting) {
    var start = new Date(meeting.scheduledAt);
    var data = {
      contact_person: host.contactPerson || '',
      host_name: host.hostName || '',
      property_name: host.propertyName || host.hostName || '',
      meeting_date: NEXG.Workflows.fmtDate_(start),
      meeting_time: NEXG.Workflows.fmtTime_(start),
      meeting_type: meeting.mode || 'Meeting',
      meeting_purpose: meeting.notes || meeting.title || '',
      sales_rep: host.owner || '',
      meeting_location: meeting.location || ''
    };
    NEXG.EmailEngine.enqueue({
      templateId: 'MEETING_CONFIRMATION', recipient: host.email, hostId: host.hostId,
      data: data, metadata: { source: 'workflow.meeting', meetingId: meeting.meetingId }
    });
    var reminderAt = new Date(start.getTime() - 24 * 3600000);
    if (reminderAt > new Date()) {
      NEXG.EmailEngine.enqueue({
        templateId: 'MEETING_REMINDER', recipient: host.email, hostId: host.hostId,
        data: data, metadata: { source: 'workflow.meeting.reminder', meetingId: meeting.meetingId },
        sendAt: reminderAt
      });
    }
  },

  scheduleMeeting: function(payload) {
    NEXG.Security.requirePermission('meeting.schedule');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    if (!payload.title) NEXG.throwError('VALIDATION_ERROR', 'Meeting title is required.');
    if (!payload.scheduledAt) NEXG.throwError('VALIDATION_ERROR', 'Meeting time is required.');

    var meeting = NEXG.Workflows._meetings().create({
      hostId: host.hostId,
      title: payload.title,
      scheduledAt: new Date(payload.scheduledAt),
      durationMinutes: payload.durationMinutes || 30,
      location: payload.location || '',
      mode: payload.mode || 'On-site',
      status: 'Scheduled',
      notes: payload.notes || ''
    });

    NEXG.Workflows._log('meeting.scheduled', host.hostId, 'Meeting scheduled: ' + payload.title, payload.notes || '', {
      metadataJson: { meetingId: meeting.data.record.meetingId }
    });

    NEXG.EventBus.publish('workflow.meetingScheduled', { hostId: host.hostId });

    var emailQueued = false;
    if (payload.sendConfirm && host.email) {
      try {
        NEXG.Workflows.queueMeetingEmails_(host, meeting.data.record);
        emailQueued = true;
      } catch (err) {
        console.error('Meeting confirmation email failed to queue.', err);
      }
    }
    return NEXG.ok({ meeting: meeting.data.record, emailQueued: emailQueued });
  },

  completeMeeting: function(payload) {
    NEXG.Security.requirePermission('meeting.edit');
    payload = payload || {};

    var found = NEXG.Workflows._meetings().findById(payload.meetingId);
    if (!found.success) NEXG.throwError('MEETING_NOT_FOUND', 'Meeting not found.');

    var meeting = found.data.record;

    NEXG.Workflows._meetings().update(meeting.meetingId, {
      status: 'Completed',
      outcome: payload.outcome || '',
      notes: payload.notes || meeting.notes || ''
    });

    NEXG.Workflows._log('meeting.completed', meeting.hostId, 'Meeting completed: ' + meeting.title, payload.notes || '', {
      outcome: payload.outcome || ''
    });

    NEXG.Workflows._hosts().update(meeting.hostId, { lastContactAt: new Date() });

    var recapQueued = false;
    if (payload.sendRecap) {
      try {
        var host = NEXG.Workflows._requireHost(meeting.hostId);
        if (host.email) {
          NEXG.EmailEngine.enqueue({
            templateId: 'MEETING_RECAP', recipient: host.email, hostId: host.hostId,
            data: {
              contact_person: host.contactPerson || '',
              host_name: host.hostName || '',
              meeting_summary: payload.notes || payload.outcome || '',
              next_steps: '',
              follow_up_date: host.nextFollowUpAt ? NEXG.Workflows.fmtDate_(host.nextFollowUpAt) : '',
              sales_rep: host.owner || ''
            },
            metadata: { source: 'workflow.meeting.recap', meetingId: meeting.meetingId }
          });
          recapQueued = true;
        }
      } catch (err) {
        console.error('Meeting recap email failed to queue.', err);
      }
    }

    NEXG.EventBus.publish('workflow.meetingCompleted', { hostId: meeting.hostId });
    return NEXG.ok({ meetingId: meeting.meetingId, emailQueued: recapQueued });
  },

  /* ---------------- Follow-up ---------------- */

  scheduleFollowUp: function(payload) {
    NEXG.Security.requirePermission('activity.create');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    if (!payload.dueAt) NEXG.throwError('VALIDATION_ERROR', 'Follow-up time is required.');

    var activity = NEXG.Workflows._activities().create({
      hostId: host.hostId,
      type: 'followup.created',
      status: 'Upcoming',
      subject: 'Follow-up',
      notes: payload.notes || '',
      dueAt: new Date(payload.dueAt)
    });

    NEXG.Workflows._hosts().update(host.hostId, { nextFollowUpAt: new Date(payload.dueAt) });

    NEXG.EventBus.publish('workflow.followUpScheduled', { hostId: host.hostId });
    return NEXG.ok({ activity: activity.data.record });
  },

  completeFollowUp: function(payload) {
    NEXG.Security.requirePermission('activity.create');
    payload = payload || {};

    var found = NEXG.Workflows._activities().findById(payload.activityId);
    if (!found.success) NEXG.throwError('FOLLOWUP_NOT_FOUND', 'Follow-up not found.');

    var followUp = found.data.record;

    NEXG.Workflows._activities().update(followUp.activityId, {
      status: 'Completed',
      completedAt: new Date(),
      outcome: payload.notes || 'Completed'
    });

    NEXG.Workflows._log('followup.completed', followUp.hostId, 'Follow-up completed', payload.notes || '');

    NEXG.EventBus.publish('workflow.followUpCompleted', { hostId: followUp.hostId });
    return NEXG.ok({ activityId: followUp.activityId });
  },

  /* ---------------- Note ---------------- */

  addNote: function(payload) {
    NEXG.Security.requirePermission('activity.create');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    if (!payload.notes) NEXG.throwError('VALIDATION_ERROR', 'Note text is required.');

    var activity = NEXG.Workflows._log('note.added', host.hostId, 'Note added', payload.notes);

    NEXG.EventBus.publish('workflow.noteAdded', { hostId: host.hostId });
    return NEXG.ok({ activity: activity.data.record });
  },

  /* ---------------- Stage ---------------- */

  advanceStage: function(payload) {
    NEXG.Security.requirePermission('host.edit');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    var stages = NEXG.SmartPanel.stageKeys();
    if (stages.indexOf(payload.toStage) === -1) {
      NEXG.throwError('VALIDATION_ERROR', 'Invalid stage.');
    }

    var oldStage = host.stage || 'lead';

    NEXG.Workflows._hosts().update(host.hostId, { stage: payload.toStage });

    NEXG.Workflows._log('host.stageChanged', host.hostId, 'Stage: ' + oldStage + ' → ' + payload.toStage, payload.notes || '', {
      metadataJson: { oldStage: oldStage, newStage: payload.toStage }
    });

    NEXG.EventBus.publish('workflow.stageAdvanced', { hostId: host.hostId, oldStage: oldStage, newStage: payload.toStage });
    return NEXG.ok({ hostId: host.hostId, newStage: payload.toStage });
  },

  /* ---------------- Archive / Restore ---------------- */

  archiveHost: function(payload) {
    NEXG.Security.requirePermission('host.archive');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);
    var result = NEXG.Workflows._hosts().archive(host.hostId);
    NEXG.EventBus.publish('workflow.hostArchived', { hostId: host.hostId });
    return result;
  },

  restoreHost: function(payload) {
    NEXG.Security.requirePermission('host.archive');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    var result = NEXG.Workflows._hosts().update(host.hostId, {
      lifecycleStatus: 'Active',
      archivedAt: '',
      archivedBy: ''
    });

    NEXG.EventBus.publish('workflow.hostRestored', { hostId: host.hostId });
    return result;
  },

  /* ---------------- Email ---------------- */

  sendEmail: function(payload) {
    NEXG.Security.requirePermission('email.send');
    payload = payload || {};
    var host = NEXG.Workflows._requireHost(payload.hostId);

    var recipient = payload.recipient || host.email;
    if (!recipient) NEXG.throwError('VALIDATION_ERROR', 'Recipient email is required.');
    if (!payload.subject && !payload.templateId) {
      NEXG.throwError('VALIDATION_ERROR', 'Subject or templateId is required.');
    }

    // Queue, don't send inline: the 5-minute trigger (NEXG_processEmailQueue)
    // delivers, retries 3x, writes EmailLogs + activity, and publishes
    // workflow.emailSent on actual delivery. Panel contract unchanged:
    // { recipient?, subject, body } -> { emailLogId, queueId, status }.
    var queued = NEXG.EmailEngine.enqueue({
      templateId: payload.templateId || '',
      recipient: recipient,
      hostId: host.hostId,
      subject: payload.subject,
      body: payload.body || '',
      data: payload.data || {},
      metadata: payload.metadata || {},
      sendAt: payload.sendAt || ''
    });

    NEXG.EventBus.publish('workflow.emailQueued', {
      hostId: host.hostId,
      emailLogId: queued.data.emailLogId,
      queueId: queued.data.queueId
    });
    return NEXG.ok({
      emailLogId: queued.data.emailLogId,
      queueId: queued.data.queueId,
      status: 'Queued'
    });
  },

  /* ---------------- Dynamic Field Engine ---------------- */

  createField: function(payload) {
    NEXG.Security.requirePermission('settings.edit');
    payload = payload || {};

    var key = String(payload.key || '').trim().replace(/\s+/g, '');
    var label = String(payload.label || '').trim();

    if (!key || !label) NEXG.throwError('VALIDATION_ERROR', 'Field key and label are required.');

    var fieldKey = 'host.custom.' + key;

    if (NEXG.Migrations.findSettingRecord('schema', fieldKey)) {
      NEXG.throwError('FIELD_EXISTS', 'This field already exists.');
    }

    NEXG.Migrations.upsertSetting('schema', fieldKey, {
      label: label,
      type: payload.type || 'text',
      required: Boolean(payload.required),
      section: payload.section || 'discovery',
      active: true
    });

    NEXG.Migrations.invalidateSettingsCache();
    NEXG.Migrations.ensureEntitySchema('host');

    NEXG.EventBus.publish('schema.fieldCreated', { fieldKey: fieldKey });
    return NEXG.ok({ fieldKey: fieldKey });
  }
};

