/**
 * NEXG CRM
 * Contract 5 — Dashboard Service (merchant-style operations overview)
 * File: 30_DashboardService.gs
 *
 * Purpose:
 * - One cached call powering the Dashboard page: KPIs, stage funnel,
 *   follow-ups due, next meetings, email stats, recent hosts + activity.
 * - Served at route panel.dashboard via NEXG.SmartPanel.dashboard
 *   (no router change needed — the panel namespace resolves by name).
 * - Cached 60s through NEXG.Cache; every mutation busts the epoch.
 */

var NEXG = NEXG || {};

NEXG.DashboardService = {

  getDashboard: function() {
    NEXG.Security.requirePermission('dashboard.view');
    return NEXG.Cache.get('dash', 60, function() {
      return NEXG.DashboardService.build_();
    });
  },

  build_: function() {
    var hosts = NEXG.getRepository('Hosts').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var acts = NEXG.getRepository('Activities').search('', { limit: 500, rawLimit: 500 }).data.records || [];
    var meetings = NEXG.getRepository('Meetings').search('', { limit: 200, rawLimit: 200 }).data.records || [];
    var emails = NEXG.getRepository('EmailLogs').search('', { limit: 500, rawLimit: 500 }).data.records || [];

    var hostById = {};
    hosts.forEach(function(h) { hostById[h.hostId] = h; });
    function hostName(id) {
      var h = hostById[id];
      return h ? h.hostName : String(id || '-');
    }

    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    var dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    var live = 0, archived = 0;
    var stageCounts = {};
    hosts.forEach(function(h) {
      var s = h.stage || 'lead';
      stageCounts[s] = (stageCounts[s] || 0) + 1;
      if (s === 'live') live++;
      if (h.lifecycleStatus === 'Archived') archived++;
    });

    var funnel = NEXG.Const.DEFAULT_STAGES.map(function(s) {
      return { key: s.key, label: s.label, count: stageCounts[s.key] || 0 };
    });

    var openFollowUps = acts
      .filter(function(a) { return a.type === 'followup.created' && a.status === 'Upcoming'; })
      .map(function(a) {
        return {
          activityId: a.activityId, hostId: a.hostId, hostName: hostName(a.hostId),
          subject: a.subject || 'Follow-up', dueAt: a.dueAt || '', notes: a.notes || '',
          overdue: a.dueAt ? new Date(a.dueAt) < now : false
        };
      })
      .sort(function(a, b) { return String(a.dueAt || '9999').localeCompare(String(b.dueAt || '9999')); });

    var meetingsNext = meetings
      .filter(function(m) {
        if (!m.scheduledAt) return false;
        var d = new Date(m.scheduledAt);
        return d >= dayStart && (m.status === 'Scheduled' || m.status === 'Confirmed' || m.status === 'Rescheduled');
      })
      .sort(function(a, b) { return String(a.scheduledAt).localeCompare(String(b.scheduledAt)); })
      .slice(0, 8)
      .map(function(m) {
        return {
          meetingId: m.meetingId, hostId: m.hostId, hostName: hostName(m.hostId),
          title: m.title, scheduledAt: m.scheduledAt, status: m.status, location: m.location || ''
        };
      });

    var emailStats = { queued: 0, sent: 0, failed: 0, opened: 0, replied: 0, total: emails.length };
    emails.forEach(function(e) {
      if (e.status === 'Sent' || e.status === 'Delivered') emailStats.sent++;
      else if (e.status === 'Failed') emailStats.failed++;
      else if (e.status === 'Queued' || e.status === 'Sending') emailStats.queued++;
      if (e.openedAt) emailStats.opened++;
      if (e.repliedAt) emailStats.replied++;
    });

    var callsWeek = acts.filter(function(a) {
      return a.type === 'call.logged' && a.createdAt && new Date(a.createdAt) >= weekAgo;
    }).length;

    var actsWeek = acts.filter(function(a) {
      return a.createdAt && new Date(a.createdAt) >= weekAgo;
    }).length;

    var meetingsWeek = meetings.filter(function(m) {
      if (!m.scheduledAt) return false;
      var d = new Date(m.scheduledAt);
      return d >= weekAgo && (m.status === 'Scheduled' || m.status === 'Confirmed' || m.status === 'Rescheduled' || m.status === 'Completed');
    }).length;

    // Full basic roster (capped) so the dialog can drill into stages offline.
    var hostsBasic = hosts.slice(0, 500).map(function(h) {
      return {
        hostId: h.hostId, hostName: h.hostName, stage: h.stage || 'lead',
        owner: h.owner || 'Unassigned', lifecycleStatus: h.lifecycleStatus || 'Active',
        phone: h.phone || '', email: h.email || ''
      };
    });

    var recentHosts = hosts
      .slice()
      .sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); })
      .slice(0, 8);

    var recentActivity = acts
      .slice()
      .sort(function(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); })
      .slice(0, 12)
      .map(function(a) {
        return {
          type: a.type, hostId: a.hostId, hostName: hostName(a.hostId),
          subject: a.subject || a.type, createdAt: a.createdAt || '', outcome: a.outcome || ''
        };
      });

    var owners = {};
    hosts.forEach(function(h) {
      var o = h.owner || 'Unassigned';
      if (!owners[o]) owners[o] = { owner: o, hosts: 0, live: 0 };
      owners[o].hosts++;
      if (h.stage === 'live') owners[o].live++;
    });
    var leaderboard = Object.keys(owners)
      .map(function(k) { return owners[k]; })
      .sort(function(a, b) { return b.hosts - a.hosts; })
      .slice(0, 8);

    var trend = [];
    for (var w = 7; w >= 0; w--) {
      var ws = new Date(dayStart.getTime() - w * 7 * 86400000);
      var we = new Date(ws.getTime() + 7 * 86400000);
      var hCount = 0, aCount = 0;
      hosts.forEach(function(h) {
        if (!h.createdAt) return;
        var d = new Date(h.createdAt);
        if (d >= ws && d < we) hCount++;
      });
      acts.forEach(function(a) {
        if (!a.createdAt) return;
        var d = new Date(a.createdAt);
        if (d >= ws && d < we) aCount++;
      });
      trend.push({
        week: Utilities.formatDate(ws, NEXG.Config.timezone, 'MMM d'),
        hosts: hCount, activities: aCount
      });
    }

    return NEXG.ok({
      totals: {
        total: hosts.length,
        active: hosts.length - archived,
        live: live,
        archived: archived
      },
      callsWeek: callsWeek,
      emailStats: emailStats,
      stageFunnel: funnel,
      followUpsDue: openFollowUps.slice(0, 10),
      followUpsDueCount: openFollowUps.length,
      overdueCount: openFollowUps.filter(function(f) { return f.overdue; }).length,
      meetingsNext: meetingsNext,
      recentHosts: recentHosts,
      recentActivity: recentActivity,
      leaderboard: leaderboard,
      trend: trend,
      callsWeek: callsWeek,
      actsWeek: actsWeek,
      meetingsWeek: meetingsWeek,
      hostsBasic: hostsBasic
    });
  }
};

/** Route panel.dashboard resolves here by namespace convention. */
NEXG.SmartPanel.dashboard = function() {
  return NEXG.DashboardService.getDashboard();
};
