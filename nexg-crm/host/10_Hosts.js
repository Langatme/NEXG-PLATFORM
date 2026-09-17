/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 10_Hosts.gs
 *
 * Purpose:
 * - Hosts repository
 */

var NEXG = NEXG || {};

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

NEXG.Repositories.Hosts = function() {
  if (!NEXG.RepositoryCache.Hosts) {
    NEXG.RepositoryCache.Hosts = NEXG.createRepository({
      name: 'Hosts',
      entity: 'host',
      permissionEntity: 'host',
      sheetName: NEXG.Config.sheetNames.hosts,
      idField: 'hostId',
      idPrefix: NEXG.Config.idPrefixes.host,
      searchFields: ['hostId', 'hostName', 'phone', 'email', 'owner', 'leadSource'],
      audit: true,
      auditLabel: 'Host',
      eventPrefix: 'host',
      dynamic: true
    });
  }

  return NEXG.RepositoryCache.Hosts;
};