/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 12_Meetings.gs
 *
 * Purpose:
 * - Meetings repository
 */

var NEXG = NEXG || {};

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

NEXG.Repositories.Meetings = function() {
  if (!NEXG.RepositoryCache.Meetings) {
    NEXG.RepositoryCache.Meetings = NEXG.createRepository({
      name: 'Meetings',
      entity: 'meeting',
      permissionEntity: 'meeting',
      sheetName: NEXG.Config.sheetNames.meetings,
      idField: 'meetingId',
      idPrefix: NEXG.Config.idPrefixes.meeting,
      searchFields: ['meetingId', 'hostId', 'title', 'location', 'mode', 'status'],
      audit: true,
      auditLabel: 'Meeting',
      eventPrefix: 'meeting',
      dynamic: true
    });
  }

  return NEXG.RepositoryCache.Meetings;
};