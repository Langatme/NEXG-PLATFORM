/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 41_Validation.gs
 *
 * Purpose:
 * - Entity validation
 * - Field normalization
 * - Entity-specific rules
 */

var NEXG = NEXG || {};

NEXG.Validation = {

  validateEntity: function(entity, payload, mode, existing) {
    payload = payload || {};
    mode = mode || 'create';

    var schema = NEXG.Migrations.getEntitySchema(entity, {
      includeDynamic: true
    });

    var data = {};
    var errors = {};
    var isCreate = mode === 'create';

    schema.forEach(function(field) {
      if (NEXG.Const.SYSTEM_WRITE_PROTECTED_FIELDS.indexOf(field.key) !== -1) {
        return;
      }

      var has = Object.prototype.hasOwnProperty.call(payload, field.key);
      var value = payload[field.key];

      if (!has) {
        if (isCreate && field.defaultValue !== undefined) {
          data[field.key] = field.defaultValue;
        }

        if (isCreate && field.required && NEXG.Utilities.isBlank(data[field.key])) {
          errors[field.key] = field.label + ' is required.';
        }

        return;
      }

      if (NEXG.Utilities.isBlank(value)) {
        if (field.required) {
          errors[field.key] = field.label + ' cannot be blank.';
          return;
        }

        data[field.key] = '';
        return;
      }

      var normalized = NEXG.Validation.normalizeField(field, value);

      if (normalized.error) {
        errors[field.key] = normalized.error;
      } else {
        data[field.key] = normalized.value;
      }
    });

    var ruleResult = NEXG.Validation.validateEntityRules(entity, data, payload, mode, existing);

    if (ruleResult.errors) {
      Object.keys(ruleResult.errors).forEach(function(key) {
        errors[key] = ruleResult.errors[key];
      });
    }

    if (Object.keys(errors).length) {
      NEXG.throwError('VALIDATION_ERROR', 'Validation failed.', errors);
    }

    return data;
  },

  normalizeField: function(field, value) {
    var type = field.type || 'text';

    try {
      if (type === 'text' || type === 'textarea' || type === 'id' || type === 'phone') {
        return { value: NEXG.Utilities.normalizeString(value) };
      }

      if (type === 'email') {
        var email = NEXG.Utilities.normalizeString(value).toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { error: field.label + ' must be a valid email address.' };
        }

        return { value: email };
      }

      if (type === 'dropdown') {
        var choice = NEXG.Utilities.normalizeString(value);
        var listName = field.options;
        var list = (typeof listName === 'string' && NEXG.Const.HOST_OPTIONS)
          ? NEXG.Const.HOST_OPTIONS[listName]
          : (Array.isArray(listName) ? listName : null);

        // No option list configured (e.g. stage): free text, back-compatible.
        if (!list) return { value: choice };

        if (list.indexOf(choice) === -1) {
          return { error: field.label + ' must be one of: ' + list.join(', ') + '.' };
        }

        return { value: choice };
      }

      if (type === 'number' || type === 'currency' || type === 'percentage') {
        var num = Number(value);

        if (isNaN(num)) {
          return { error: field.label + ' must be a number.' };
        }

        return { value: num };
      }

      if (type === 'date' || type === 'datetime') {
        var date = value;

        if (!(value instanceof Date)) {
          date = new Date(value);
        }

        if (isNaN(date.getTime())) {
          return { error: field.label + ' must be a valid date.' };
        }

        return { value: date };
      }

      if (type === 'checkbox') {
        return { value: NEXG.Utilities.isActive(value) };
      }

      if (type === 'json') {
        if (typeof value === 'object') {
          return { value: value };
        }

        var parsed = NEXG.Utilities.parseJson(value, undefined);

        if (parsed === undefined) {
          return { error: field.label + ' must be valid JSON.' };
        }

        return { value: parsed };
      }

      if (type === 'multiselect' || type === 'tags') {
        if (Array.isArray(value)) {
          return { value: value };
        }

        return {
          value: String(value)
            .split(',')
            .map(function(item) {
              return item.trim();
            })
            .filter(function(item) {
              return item !== '';
            })
        };
      }

      return { value: NEXG.Utilities.normalizeString(value) };
    } catch (err) {
      return { error: field.label + ' could not be normalized.' };
    }
  },

  validateEntityRules: function(entity, data, payload, mode, existing) {
    var errors = {};

    if (entity === 'host') {
      if (data.lifecycleStatus && NEXG.Const.LIFECYCLE_STATUSES.indexOf(data.lifecycleStatus) === -1) {
        errors.lifecycleStatus = 'Invalid lifecycle status.';
      }
    }

    if (entity === 'activity') {
      if (data.hostId && data.hostId !== 'SYSTEM') {
        if (!NEXG.Validation.recordExists('Hosts', data.hostId)) {
          errors.hostId = 'Host not found.';
        }
      }

      if (data.status === 'Completed' && NEXG.Utilities.isBlank(data.completedAt)) {
        data.completedAt = new Date();
      }
    }

    if (entity === 'meeting') {
      if (data.hostId && !NEXG.Validation.recordExists('Hosts', data.hostId)) {
        errors.hostId = 'Host not found.';
      }

      if (data.status && NEXG.Const.MEETING_STATUSES.indexOf(data.status) === -1) {
        errors.status = 'Invalid meeting status.';
      }
    }

    if (entity === 'email') {
      if (data.hostId && !NEXG.Validation.recordExists('Hosts', data.hostId)) {
        errors.hostId = 'Host not found.';
      }

      if (data.recipient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.recipient).toLowerCase())) {
        errors.recipient = 'Recipient must be a valid email address.';
      }

      if (data.status && NEXG.Const.EMAIL_STATUSES.indexOf(data.status) === -1) {
        errors.status = 'Invalid email status.';
      }
    }

    if (entity === 'settings' && mode === 'create') {
      if (data.category && data.key) {
        var duplicate = NEXG.Migrations.findSettingRecord(data.category, data.key);

        if (duplicate) {
          errors.key = 'A setting with this category and key already exists.';
        }
      }
    }

    return { errors: errors };
  },

  recordExists: function(repoKey, id) {
    if (NEXG.Utilities.isBlank(id)) {
      return false;
    }

    var meta = NEXG.Const.REPO_META[repoKey];

    if (!meta) {
      return false;
    }

    var sheet = NEXG.Sheets.getSheet(meta.sheetName);

    if (!sheet) {
      return false;
    }

    return NEXG.Sheets.findRowById(sheet, meta.idField, id) > 0;
  }
};