/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 13_EmailLogs.gs
 *
 * Purpose:
 * - EmailLogs repository
 */

var NEXG = NEXG || {};

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

NEXG.Repositories.EmailLogs = function() {
  if (!NEXG.RepositoryCache.EmailLogs) {
    NEXG.RepositoryCache.EmailLogs = NEXG.createRepository({
      name: 'EmailLogs',
      entity: 'email',
      permissionEntity: 'email',
      sheetName: NEXG.Config.sheetNames.emailLogs,
      idField: 'emailLogId',
      idPrefix: NEXG.Config.idPrefixes.email,
      searchFields: ['emailLogId', 'hostId', 'recipient', 'subject', 'status', 'templateId'],
      audit: true,
      auditLabel: 'Email Log',
      eventPrefix: 'email',
      dynamic: true
    });
  }

  return NEXG.RepositoryCache.EmailLogs;
};