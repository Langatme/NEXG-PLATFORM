/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 11_Activities.gs
 *
 * Purpose:
 * - Activities repository
 */

var NEXG = NEXG || {};

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

NEXG.Repositories.Activities = function() {
  if (!NEXG.RepositoryCache.Activities) {
    NEXG.RepositoryCache.Activities = NEXG.createRepository({
      name: 'Activities',
      entity: 'activity',
      permissionEntity: 'activity',
      sheetName: NEXG.Config.sheetNames.activities,
      idField: 'activityId',
      idPrefix: NEXG.Config.idPrefixes.activity,
      searchFields: ['activityId', 'hostId', 'type', 'subtype', 'subject', 'outcome'],
      audit: false,
      auditLabel: 'Activity',
      eventPrefix: 'activity',
      dynamic: true
    });
  }

  return NEXG.RepositoryCache.Activities;
};