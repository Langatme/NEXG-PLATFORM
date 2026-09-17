/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 05_Migrations.gs
 */

var NEXG = NEXG || {};

NEXG.Migrations = {
  getCoreSchema: function(entity) {
    var schema = NEXG.Const.CORE_SCHEMAS[entity];
    if (!schema) NEXG.throwError('SCHEMA_NOT_FOUND', 'No core schema found for entity: ' + entity);
    return schema.slice();
  },

  getEntitySchema: function(entity, options) {
    options = options || {};
    var schema = NEXG.Migrations.getCoreSchema(entity);
    if (entity !== 'settings' && options.includeDynamic !== false) {
      var dynamicFields = NEXG.Migrations.getDynamicFields(entity);
      schema = schema.concat(dynamicFields);
    }
    return schema;
  },

  getDynamicFields: function(entity) {
    var settings = NEXG.Migrations.findSettingsByCategory('schema');
    return settings
      .filter(function(record) {
        return NEXG.Utilities.isActive(record.active) && String(record.key).indexOf(entity + '.') === 0;
      })
      .map(function(record) {
        var value = record.valueJson;
        if (typeof value !== 'object') value = {};
        return {
          key: record.key,
          label: value.label || record.key,
          type: value.type || 'text',
          required: Boolean(value.required),
          options: value.options || [],
          section: value.section || 'general',
          dynamic: true
        };
      });
  },

    findSettingsByCategory: function(category) {
    NEXG.Migrations._settingsCache = NEXG.Migrations._settingsCache || {};

    if (NEXG.Migrations._settingsCache[category]) {
      return NEXG.Migrations._settingsCache[category];
    }

    var sheet = NEXG.Sheets.getSheet(NEXG.Config.sheetNames.settings);
    var records = [];

    if (sheet) {
      records = NEXG.Sheets.getRecords(sheet, { idField: 'settingId' })
        .filter(function(record) {
          return String(record.category) === String(category);
        })
        .map(function(record) {
          return NEXG.Migrations.parseRecord('settings', record);
        });
    }

    NEXG.Migrations._settingsCache[category] = records;
    return records;
  },

  invalidateSettingsCache: function() {
    NEXG.Migrations._settingsCache = {};
  },

  findSettingRecord: function(category, key) {
    var records = NEXG.Migrations.findSettingsByCategory(category);
    for (var i = 0; i < records.length; i++) {
      if (String(records[i].key) === String(key)) return records[i];
    }
    return null;
  },

  upsertSetting: function(category, key, value, options) {
    options = options || {};
    if (NEXG.Utilities.isBlank(category)) NEXG.throwError('VALIDATION_ERROR', 'Setting category is required.');
    if (NEXG.Utilities.isBlank(key)) NEXG.throwError('VALIDATION_ERROR', 'Setting key is required.');

        var execute = function() {
      var existing = NEXG.Migrations.findSettingRecord(category, key);
      var repo = NEXG.getRepository('Settings');

      var result;

      if (existing) {
        result = repo.update(existing.settingId, { valueJson: value, active: true });
      } else {
        result = repo.create({ category: category, key: key, valueJson: value, active: true });
      }

      NEXG.Migrations.invalidateSettingsCache();
      NEXG.bustBootCache();
      return result;
    };

    if (options.silent) return NEXG.suppressAudit(execute);
    return execute();
  },

  ensureCoreSchemas: function() {
    Object.keys(NEXG.Const.CORE_SCHEMAS).forEach(function(entity) {
      NEXG.Migrations.ensureEntitySchema(entity);
    });
  },

    ensureEntitySchema: function(entity) {
    var entityToSheetKey = {
      host: 'hosts',
      activity: 'activities',
      meeting: 'meetings',
      email: 'emailLogs',
      settings: 'settings'
    };

    var sheetKey = entityToSheetKey[entity];

    if (!sheetKey || !NEXG.Config.sheetNames[sheetKey]) {
      NEXG.throwError('SHEET_NOT_MAPPED', 'No sheet mapped for entity: ' + entity);
    }

    var sheetName = NEXG.Config.sheetNames[sheetKey];
    var sheet = NEXG.Sheets.ensureSheet(sheetName);

    var coreFields = NEXG.Migrations.getCoreSchema(entity).map(function(field) {
      return field.key;
    });

    var changed = NEXG.Sheets.ensureHeaders(sheet, coreFields);

    if (entity !== 'settings') {
      var dynamicFields = NEXG.Migrations.getDynamicFields(entity).map(function(field) {
        return field.key;
      });

      if (dynamicFields.length && NEXG.Sheets.ensureHeaders(sheet, dynamicFields)) {
        changed = true;
      }
    }

    // Only format when the schema actually changed (keeps saves fast)
    if (changed) {
      NEXG.Sheets.formatSheet(sheet);
    }

    return sheet;
  },

  ensureDynamicColumns: function() {
    ['host', 'activity', 'meeting', 'email'].forEach(function(entity) {
      NEXG.Migrations.ensureEntitySchema(entity);
    });
  },

  ensureDefaultStages: function() {
    NEXG.Const.DEFAULT_STAGES.forEach(function(stage, index) {
      NEXG.Migrations.upsertSetting('stage', stage.key, {
        label: stage.label, order: index + 1, active: true
      }, { silent: true });
    });
  },

  ensureDefaultActivityTypes: function() {
    NEXG.Const.DEFAULT_ACTIVITY_TYPES.forEach(function(activityType) {
      NEXG.Migrations.upsertSetting('activityType', activityType.key, {
        label: activityType.label, active: true
      }, { silent: true });
    });
  },

  ensureSchemaVersion: function() {
    NEXG.Migrations.upsertSetting('migration', 'schemaVersion', {
      version: 1, updatedAt: NEXG.Utilities.nowIso()
    }, { silent: true });
  },

  parseRecord: function(entity, record) {
    if (!record) return null;
    var clone = {};
    Object.keys(record).forEach(function(key) { clone[key] = record[key]; });

    var schema = NEXG.Migrations.getEntitySchema(entity, { includeDynamic: entity !== 'settings' });
    schema.forEach(function(field) {
      var value = clone[field.key];
      if (field.type === 'json' && typeof value === 'string') clone[field.key] = NEXG.Utilities.parseJson(value, value);
      if ((field.type === 'date' || field.type === 'datetime') && value instanceof Date) clone[field.key] = value.toISOString();
      if ((field.type === 'number' || field.type === 'currency' || field.type === 'percentage') && value !== '' && value !== undefined && value !== null) clone[field.key] = Number(value);
      if (field.type === 'checkbox') clone[field.key] = NEXG.Utilities.isActive(value);
    });
    return clone;
  }
};

NEXG.parseRecord = function(entity, record) {
  return NEXG.Migrations.parseRecord(entity, record);
};