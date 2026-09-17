/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 14_Settings.gs
 *
 * Purpose:
 * - Settings repository
 */

var NEXG = NEXG || {};

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

NEXG.Repositories.Settings = function() {
  if (!NEXG.RepositoryCache.Settings) {
    var repo = NEXG.createRepository({
      name: 'Settings',
      entity: 'settings',
      permissionEntity: 'settings',
      sheetName: NEXG.Config.sheetNames.settings,
      idField: 'settingId',
      idPrefix: NEXG.Config.idPrefixes.settings,
      searchFields: ['settingId', 'category', 'key'],
      audit: true,
      auditLabel: 'Setting',
      eventPrefix: 'settings',
      dynamic: false
    });

    repo.findByCategoryKey = function(category, key) {
      var result = repo.findByField('category', category);

      if (!result.success) {
        return result;
      }

      var records = result.data.records || [];

      for (var i = 0; i < records.length; i++) {
        if (String(records[i].key) === String(key)) {
          return NEXG.ok({ record: records[i] });
        }
      }

      return NEXG.fail('NOT_FOUND', 'Setting not found.');
    };

    NEXG.RepositoryCache.Settings = repo;
  }

  return NEXG.RepositoryCache.Settings;
};