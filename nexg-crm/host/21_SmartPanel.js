/**
 * NEXG CRM
 * Contract 3 — Smart Panel Controller + Widget Registry
 * File: 21_SmartPanel.gs
 */

var NEXG = NEXG || {};

/**
 * Widget Registry.
 * Widgets are declared, not hardcoded. Future modules reuse this engine.
 */
NEXG.WidgetRegistry = [
  { id: 'relationship-summary', title: 'Relationship Summary', placement: 'home', order: 1, permission: 'host.view', refresh: ['host.updated', 'workflow.hostRestored'] },
  { id: 'journey', title: 'Journey', placement: 'home', order: 2, permission: 'host.view', refresh: ['workflow.stageAdvanced'] },
  { id: 'action-center', title: 'Action Center', placement: 'home', order: 3, permission: 'host.view', refresh: ['*'] },
  { id: 'recent-activity', title: 'Recent Activity', placement: 'home', order: 4, permission: 'activity.view', refresh: ['activity.created', 'workflow.callLogged', 'workflow.noteAdded'] },
  { id: 'upcoming', title: 'Upcoming', placement: 'home', order: 5, permission: 'host.view', refresh: ['workflow.followUpScheduled', 'workflow.meetingScheduled', 'workflow.followUpCompleted'] },
  { id: 'followup-queue', title: 'Follow-up Queue', placement: 'operations', order: 1, permission: 'activity.view', refresh: ['workflow.followUpCompleted'] },
  { id: 'meetings-today', title: 'Meetings Today', placement: 'operations', order: 2, permission: 'meeting.view', refresh: ['workflow.meetingCompleted'] },
  { id: 'hosts-table', title: 'Hosts', placement: 'operations', order: 3, permission: 'host.view', refresh: ['host.created', 'host.updated'] },
  { id: 'pipeline', title: 'Pipeline', placement: 'insights', order: 1, permission: 'dashboard.view', refresh: ['workflow.stageAdvanced', 'host.created'] },
  { id: 'activity-metrics', title: 'Activity Metrics', placement: 'insights', order: 2, permission: 'dashboard.view', refresh: ['activity.created'] }
];

NEXG.SmartPanel = {

  BOOT_CACHE_SECONDS: 45,

  bootCacheKey_: function() {
    return 'nx_boot_' + NEXG.Security.getCurrentUserEmail();
  },

  bustBootCache: function() {
    try {
      CacheService.getUserCache().remove(NEXG.SmartPanel.bootCacheKey_());
    } catch (err) {}
  },

  stages: function() {
    return NEXG.Migrations.findSettingsByCategory('stage')
      .map(function(s) {
        var v = s.valueJson || {};
        return { key: s.key, label: v.label || s.key, order: v.order || 0 };
      })
      .sort(function(a, b) { return a.order - b.order; });
  },

  stageKeys: function() {
    return NEXG.SmartPanel.stages().map(function(s) { return s.key; });
  },

  getBootstrap: function() {
    try {
      NEXG.Security.requirePermission('panel.use');

      // Warm path: repeat opens/tabs within TTL skip every sheet scan.
      // Mutations bust the key (see NEXG.bustBootCache), so data is fresh.
      var cacheKey = NEXG.SmartPanel.bootCacheKey_();
      try {
        var hit = CacheService.getUserCache().get(cacheKey);
        if (hit) {
          var parsed = NEXG.Utilities.parseJson(hit, null);
          if (parsed) return NEXG.ok(parsed);
        }
      } catch (err) {}

      var hostsResult = NEXG.getRepository('Hosts').search('', { limit: 500, rawLimit: 500 });
      var hosts = hostsResult.success ? hostsResult.data.records : [];

      var actsResult = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 });
      var acts = actsResult.success ? actsResult.data.records : [];

      var meetsResult = NEXG.getRepository('Meetings').search('', { limit: 200, rawLimit: 200 });
      var meetings = meetsResult.success ? meetsResult.data.records : [];

      var openFollowUps = acts.filter(function(a) {
        return a.type === 'followup.created' && a.status === 'Upcoming';
      });

      // Today summary rides along so the Today tab needs zero extra calls.
      var now = new Date();
      var dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      var meetingsToday = meetings.filter(function(m) {
        if (!m.scheduledAt) return false;
        var d = new Date(m.scheduledAt);
        return d >= dayStart && d <= dayEnd &&
          (m.status === 'Scheduled' || m.status === 'Confirmed' || m.status === 'Rescheduled');
      });

      var pinned = NEXG.Migrations.findSettingsByCategory('pinnedSearch')
        .filter(function(r) { return r.active !== false; })
        .map(function(r) { return r.key; });

      // Dashboard page contract (DashboardJS.html): totals + recentHosts.
      // Computed from the already-fetched hosts — zero extra sheet reads.
      var liveHosts = hosts.filter(function(h) { return h.stage === 'live'; });
      var archivedHosts = hosts.filter(function(h) { return h.lifecycleStatus === 'Archived'; });

      var payload = {
        user: NEXG.Security.getCurrentUserEmail(),
        permissions: NEXG.Security.getBootstrapPayload().permissions,
        stages: NEXG.SmartPanel.stages(),
        registry: NEXG.WidgetRegistry,
        recentHosts: hosts.slice(0, 10),
        hostCount: hosts.length,
        followUpCount: openFollowUps.length,
        pinned: pinned,
        emailTemplates: NEXG.EmailTemplates.list(),
        today: {
          followUpCount: openFollowUps.length,
          meetingsTodayCount: meetingsToday.length,
          meetingsToday: meetingsToday.slice(0, 10)
        },
        hostOptions: NEXG.Const.HOST_OPTIONS,
        totals: {
          total: hosts.length,
          active: hosts.length - archivedHosts.length,
          live: liveHosts.length,
          archived: archivedHosts.length
        }
      };

      try {
        CacheService.getUserCache().put(cacheKey, JSON.stringify(payload), NEXG.SmartPanel.BOOT_CACHE_SECONDS);
      } catch (err) {}

      return NEXG.ok(payload);
    } catch (err) {
      if (err.name === 'NexgApiError') return NEXG.fail(err.code, err.message, err.details);
      return NEXG.fail('BOOTSTRAP_FAILED', err.message);
    }
  },

  getWorkspace: function(payload) {
    var hostId = String((payload || {}).hostId || '');
    return NEXG.Cache.get('ws_' + hostId, 60, function() {
      return NEXG.SmartPanel.getWorkspaceUncached(payload);
    });
  },

  getWorkspaceUncached: function(payload) {
    try {
      NEXG.Security.requirePermission('host.view');

      var hostId = payload.hostId;
      var hostRes = NEXG.getRepository('Hosts').findById(hostId);
      if (!hostRes.success) return NEXG.fail('HOST_NOT_FOUND', 'Host not found.');
      var host = hostRes.data.record;

      var acts = NEXG.getRepository('Activities').findByField('hostId', hostId).data.records || [];
      acts.sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });

      var meetings = NEXG.getRepository('Meetings').findByField('hostId', hostId).data.records || [];
      meetings.sort(function(a, b) { return String(a.scheduledAt || '').localeCompare(String(b.scheduledAt || '')); });

      var emails = NEXG.getRepository('EmailLogs').findByField('hostId', hostId).data.records || [];
      emails.sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });

      var followUps = acts.filter(function(a) {
        return a.type === 'followup.created' && a.status === 'Upcoming';
      });

      return NEXG.ok({
        host: host,
        activities: acts.slice(0, 30),
        meetings: meetings,
        emails: emails.slice(0, 5),
        followUps: followUps,
        dynamicFields: NEXG.Migrations.getDynamicFields('host')
      });
    } catch (err) {
      if (err.name === 'NexgApiError') return NEXG.fail(err.code, err.message, err.details);
      return NEXG.fail('WORKSPACE_FAILED', err.message);
    }
  },

  search: function(payload) {
    try {
      NEXG.Security.requirePermission('host.view');
      var q = String(payload.query || '').trim();
      if (!q) return NEXG.ok({ hosts: [], activities: [], meetings: [], emails: [] });

      var pick = function(res) { return res.success ? res.data.records : []; };

      return NEXG.ok({
        hosts: pick(NEXG.getRepository('Hosts').search(q, { limit: 6, rawLimit: 200 })).slice(0, 6),
        activities: pick(NEXG.getRepository('Activities').search(q, { limit: 4, rawLimit: 200 })).slice(0, 4),
        meetings: pick(NEXG.getRepository('Meetings').search(q, { limit: 4, rawLimit: 200 })).slice(0, 4),
        emails: pick(NEXG.getRepository('EmailLogs').search(q, { limit: 4, rawLimit: 200 })).slice(0, 4)
      });
    } catch (err) {
      return NEXG.fail('SEARCH_FAILED', err.message);
    }
  },

  getOperations: function() {
    return NEXG.Cache.get('ops', 60, function() {
      return NEXG.SmartPanel.getOperationsUncached();
    });
  },

  getOperationsUncached: function() {
    try {
      NEXG.Security.requirePermission('activity.view');

      var acts = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 }).data.records || [];
      var meetings = NEXG.getRepository('Meetings').search('', { limit: 500, rawLimit: 500 }).data.records || [];
      var hosts = NEXG.getRepository('Hosts').search('', { limit: 200, rawLimit: 200 }).data.records || [];

      var now = new Date();
      var endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      var followUps = acts
        .filter(function(a) { return a.type === 'followup.created' && a.status === 'Upcoming'; })
        .map(function(a) {
          a.overdue = a.dueAt && new Date(a.dueAt) < now;
          return a;
        })
        .sort(function(a, b) { return String(a.dueAt || '').localeCompare(String(b.dueAt || '')); });

      var meetingsToday = meetings.filter(function(m) {
        if (!m.scheduledAt) return false;
        var d = new Date(m.scheduledAt);
        return d <= endOfDay && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) &&
          (m.status === 'Scheduled' || m.status === 'Confirmed' || m.status === 'Rescheduled');
      });

      return NEXG.ok({
        followUps: followUps.slice(0, 20),
        meetingsToday: meetingsToday,
        hosts: hosts.slice(0, 20)
      });
    } catch (err) {
      return NEXG.fail('OPERATIONS_FAILED', err.message);
    }
  },

  getInsights: function() {
    try {
      NEXG.Security.requirePermission('dashboard.view');

      var hosts = NEXG.getRepository('Hosts').search('', { limit: 500, rawLimit: 500 }).data.records || [];
      var acts = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 }).data.records || [];
      var emails = NEXG.getRepository('EmailLogs').search('', { limit: 500, rawLimit: 500 }).data.records || [];

      var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      var counts = {};
      hosts.forEach(function(h) {
        var s = h.stage || 'lead';
        counts[s] = (counts[s] || 0) + 1;
      });

      var weekActs = acts.filter(function(a) { return a.createdAt && new Date(a.createdAt) >= weekAgo; });

      return NEXG.ok({
        totals: {
          hosts: hosts.length,
          live: counts['live'] || 0,
          callsThisWeek: weekActs.filter(function(a) { return a.type === 'call.logged'; }).length,
          meetingsThisWeek: weekActs.filter(function(a) { return a.type === 'meeting.completed'; }).length,
          emailsSent: emails.filter(function(e) { return e.status === 'Sent'; }).length
        },
        stageCounts: counts
      });
    } catch (err) {
      return NEXG.fail('INSIGHTS_FAILED', err.message);
    }
  }
};

/**
 * Public bootstrap kept for backwards compatibility.
 */
function NEXG_getPanelBootstrap() {
  return NEXG.SmartPanel.getBootstrap();
}