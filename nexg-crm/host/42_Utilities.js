/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 42_Utilities.gs
 */

var NEXG = NEXG || {};

NEXG.Utilities = {
  nowIso: function() { return new Date().toISOString(); },
  isBlank: function(value) { return value === undefined || value === null || String(value).trim() === ''; },
  normalizeString: function(value) { return NEXG.Utilities.isBlank(value) ? '' : String(value).trim(); },
  parseJson: function(value, fallback) {
    if (NEXG.Utilities.isBlank(value)) return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch (err) { return fallback; }
  },
  toJson: function(value) {
    if (NEXG.Utilities.isBlank(value)) return '';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  },
  isActive: function(value) {
    if (value === true) return true;
    if (value === false || value === undefined || value === null) return false;
    var normalized = String(value).trim().toLowerCase();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  },
  withLock: function(fn) {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try { return fn(); } finally { lock.releaseLock(); }
  },
  serializeCell: function(value) {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  }
};

NEXG.Sheets = {
  getSpreadsheet: function() {
    var props = PropertiesService.getScriptProperties();
    var storedId = props.getProperty(NEXG.Config.scriptPropertyKeys.spreadsheetId);
    var configuredId = NEXG.Config.spreadsheetId || storedId;

    if (configuredId) {
      var byId = SpreadsheetApp.openById(configuredId);
      props.setProperty(NEXG.Config.scriptPropertyKeys.spreadsheetId, byId.getId());
      return byId;
    }

    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      props.setProperty(NEXG.Config.scriptPropertyKeys.spreadsheetId, active.getId());
      return active;
    }

    var created = SpreadsheetApp.create('NEXG CRM Database');
    props.setProperty(NEXG.Config.scriptPropertyKeys.spreadsheetId, created.getId());
    return created;
  },

  getSheet: function(sheetName) { return NEXG.Sheets.getSpreadsheet().getSheetByName(sheetName); },

  ensureSheet: function(sheetName) {
    var ss = NEXG.Sheets.getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    return sheet;
  },

  getHeaderEntries: function(sheet) {
    var lastCol = sheet.getLastColumn();
    if (!lastCol) return [];
    var values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var entries = [];
    values.forEach(function(value, index) {
      var header = String(value || '').trim();
      if (header) entries.push({ header: header, col: index + 1 });
    });
    return entries;
  },

  getHeaderMap: function(sheet) {
    var entries = NEXG.Sheets.getHeaderEntries(sheet);
    var map = {};
    entries.forEach(function(entry) { map[entry.header] = entry.col; });
    return map;
  },

    ensureHeaders: function(sheet, headers) {
    var lastCol = sheet.getLastColumn();
    var existing = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var existingMap = {};
    var lastHeaderIndex = 0;

    existing.forEach(function(value, index) {
      var header = String(value || '').trim();
      if (header) {
        existingMap[header] = index + 1;
        lastHeaderIndex = index + 1;
      }
    });

    var missing = headers.filter(function(header) {
      return !existingMap[header];
    });

    if (missing.length) {
      var startCol = lastHeaderIndex + 1;
      sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
      NEXG.Sheets.protectHeader(sheet);
      return true;
    }

    return false;
  },
  protectHeader: function(sheet) {
    try {
      var lastCol = sheet.getLastColumn();
      if (!lastCol) return;
      var range = sheet.getRange(1, 1, 1, lastCol);
      var description = 'NEXG Header Protection';
      var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      var exists = protections.some(function(protection) { return protection.getDescription() === description; });
      
      if (!exists) {
        var protection = range.protect();
        protection.setDescription(description);
        protection.setWarningOnly(true); // FIXED: Changed from string to boolean
      }
    } catch (err) {
      console.warn('Could not protect header range.', err);
    }
  },

  appendRecord: function(sheet, record) {
    var headerMap = NEXG.Sheets.getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var rowValues = [];
    for (var i = 0; i < lastCol; i++) rowValues.push('');

    Object.keys(record).forEach(function(key) {
      var col = headerMap[key];
      if (col) {
        while (rowValues.length < col) rowValues.push('');
        rowValues[col - 1] = NEXG.Utilities.serializeCell(record[key]);
      }
    });
    if (!rowValues.length) rowValues = [''];
    sheet.appendRow(rowValues);
  },

  updateRow: function(sheet, row, updates) {
    var headerMap = NEXG.Sheets.getHeaderMap(sheet);
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var rowValues = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

    Object.keys(updates).forEach(function(key) {
      var col = headerMap[key];
      if (col) {
        while (rowValues.length < col) rowValues.push('');
        rowValues[col - 1] = NEXG.Utilities.serializeCell(updates[key]);
      }
    });
    sheet.getRange(row, 1, 1, rowValues.length).setValues([rowValues]);
  },

  findRowById: function(sheet, idField, id) {
    if (NEXG.Utilities.isBlank(id)) return -1;
    var headerMap = NEXG.Sheets.getHeaderMap(sheet);
    var idCol = headerMap[idField];
    if (!idCol) return -1;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return -1;

    var range = sheet.getRange(2, idCol, lastRow - 1, 1);
    var found = range.createTextFinder(String(id))
      .matchCase(true) // FIXED: Changed from matchCaseSensitive(true)
      .matchEntireCell(true)
      .findNext();

    return found ? found.getRow() : -1;
  },

  getRecordFromRow: function(sheet, row) {
    var headerEntries = NEXG.Sheets.getHeaderEntries(sheet);
    var lastCol = sheet.getLastColumn();
    if (!lastCol) return null;
    var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
    var record = {};
    var hasValue = false;
    headerEntries.forEach(function(entry) {
      var value = values[entry.col - 1];
      if (value !== undefined && value !== null && value !== '') hasValue = true;
      record[entry.header] = value;
    });
    return hasValue ? record : null;
  },

  getRecords: function(sheet, options) {
    options = options || {};
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || !lastCol) return [];
    var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerEntries = NEXG.Sheets.getHeaderEntries(sheet);
    var records = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var record = {};
      var hasValue = false;
      headerEntries.forEach(function(entry) {
        var value = row[entry.col - 1];
        if (value !== undefined && value !== null && value !== '') hasValue = true;
        record[entry.header] = value;
      });
      if (!hasValue) continue;
      if (options.idField && NEXG.Utilities.isBlank(record[options.idField])) continue;
      if (typeof options.filter === 'function' && !options.filter(record)) continue;
      records.push(record);
      if (options.limit && records.length >= options.limit) break;
    }
    return records;
  },

  /**
   * Applies the strict Black, Gold, and White enterprise theme.
   */
  formatSheet: function(sheet) {
    if (!sheet) return;
    
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return;
    
    var lastRow = sheet.getLastRow();
    var maxRows = Math.max(lastRow, 20); 
    if (maxRows > 1000) maxRows = 1000; 

    // 1. Header Row (Strict Black & Gold)
    var headerRange = sheet.getRange(1, 1, 1, lastCol);
    headerRange.setBackground('#0A0A0A'); // Rich Black
    headerRange.setFontColor('#D4AF37');  // Metallic Gold
    headerRange.setFontFamily('Arial'); 
    headerRange.setFontSize(11);
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setWrap(true);
    
    // Gold borders for header
    headerRange.setBorder(true, true, true, true, true, true, '#D4AF37', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    // 2. Body Rows (Clean White)
    if (maxRows > 1) {
      var bodyRange = sheet.getRange(2, 1, maxRows - 1, lastCol);
      bodyRange.setBackground('#FFFFFF');
      bodyRange.setFontColor('#111827'); 
      bodyRange.setFontFamily('Arial');
      bodyRange.setFontSize(10);
      bodyRange.setVerticalAlignment('middle');
      bodyRange.setHorizontalAlignment('left');
      
      // Subtle gray borders for data
      var borderColor = '#E5E7EB';
      bodyRange.setBorder(true, true, true, true, true, true, borderColor, SpreadsheetApp.BorderStyle.SOLID_THIN);
    }

    // 3. Auto-resize Columns
    for (var c = 1; c <= lastCol; c++) {
      try {
        sheet.autoResizeColumn(c);
        var currentWidth = sheet.getColumnWidth(c);
        if (currentWidth < 120) sheet.setColumnWidth(c, 120);
        if (currentWidth > 350) sheet.setColumnWidth(c, 350);
      } catch (e) {}
    }

    // 4. Freeze Header Row
    sheet.setFrozenRows(1);
  }
};

/**
 * Drops the cached bootstrap payload so the next panel load re-reads sheets.
 * Called by every repository mutation + settings writes. Guarded: safe to call
 * before SmartPanel exists (e.g. during init).
 */
NEXG.bustBootCache = function() {
  try {
    if (NEXG.SmartPanel && typeof NEXG.SmartPanel.bustBootCache === 'function') {
      NEXG.SmartPanel.bustBootCache();
    }
    NEXG.Cache.bump_();
  } catch (err) {}
};

/**
 * Epoch-keyed response cache (per user). Every mutation bumps the epoch via
 * NEXG.bustBootCache, so cached workspace/operations/insights payloads stay
 * fresh without per-key bookkeeping. TTL bounds staleness from out-of-band
 * (hand-typed) sheet edits.
 */
NEXG.Cache = {
  TTL: 60,
  EPOCH_TTL: 21600,

  epoch_: function() {
    try {
      var c = CacheService.getUserCache();
      var e = c.get('nx_epoch');
      if (!e) { c.put('nx_epoch', '1', NEXG.Cache.EPOCH_TTL); return '1'; }
      return e;
    } catch (err) {
      return '0';
    }
  },

  bump_: function() {
    try {
      var c = CacheService.getUserCache();
      var e = parseInt(c.get('nx_epoch') || '0', 10) + 1;
      c.put('nx_epoch', String(e), NEXG.Cache.EPOCH_TTL);
    } catch (err) {}
  },

  key_: function(name) {
    var user = '';
    try { user = NEXG.Security.getCurrentUserEmail(); } catch (err) {}
    return 'nx_' + NEXG.Cache.epoch_() + '_' + user + '_' + name;
  },

  get: function(name, ttl, compute) {
    var key = NEXG.Cache.key_(name);
    try {
      var hit = CacheService.getUserCache().get(key);
      if (hit) {
        var parsed = NEXG.Utilities.parseJson(hit, null);
        if (parsed) return NEXG.ok(parsed);
      }
    } catch (err) {}
    var res = compute();
    try {
      if (res && res.success) {
        CacheService.getUserCache().put(key, JSON.stringify(res.data), ttl || NEXG.Cache.TTL);
      }
    } catch (err) {}
    return res;
  }
};

/**
 * Generic repository factory.
 */
NEXG.createRepository = function(config) {
  function ensureSchema() { NEXG.Migrations.ensureEntitySchema(config.entity); }
  function getSheet() { return NEXG.Sheets.getSheet(config.sheetName); }
  
  function parse(record) {
    if (!record) return null;
    if (typeof NEXG.parseRecord === 'function') return NEXG.parseRecord(config.entity, record);
    return record;
  }

  function requirePermission(action) {
    if (NEXG.Security.isSystemMode()) return;
    NEXG.Security.requirePermission(config.permissionEntity + '.' + action);
  }

  function audit(action, record) {
    if (!config.audit || NEXG.isAuditSuppressed()) return;
    NEXG.Audit.log({
      hostId: record.hostId || record[config.idField] || 'SYSTEM',
      type: config.eventPrefix + '.' + action,
      subject: config.auditLabel + ' ' + action,
      metadataJson: { entityId: record[config.idField], entity: config.entity }
    });
  }

  return {
    name: config.name,
    entity: config.entity,
    sheetName: config.sheetName,
    idField: config.idField,

    create: function(payload) {
      requirePermission('create');
      ensureSchema();
      var data = NEXG.Validation.validateEntity(config.entity, payload, 'create');
      var now = new Date();
      var user = NEXG.Security.getCurrentUserEmail();

      data[config.idField] = NEXG.IdGenerator.nextId(config.idPrefix);
      data.createdAt = now;
      data.createdBy = user;
      data.updatedAt = now;
      data.updatedBy = user;
      data.archivedAt = data.archivedAt || '';
      data.archivedBy = data.archivedBy || '';

      var sheet = getSheet();
      NEXG.Utilities.withLock(function() { NEXG.Sheets.appendRecord(sheet, data); });

      var record = parse(data);
      audit('created', record);
      NEXG.EventBus.publish(config.eventPrefix + '.created', record);
      NEXG.bustBootCache();
      return NEXG.ok({ record: record });
    },

    update: function(id, payload) {
      requirePermission('edit');
      ensureSchema();
      if (NEXG.Utilities.isBlank(id)) NEXG.throwError('ID_MISSING', 'Record ID is required.');

      var sheet = getSheet();
      var row = NEXG.Sheets.findRowById(sheet, config.idField, id);
      if (row < 0) return NEXG.fail('NOT_FOUND', config.name + ' record not found.');

      var existing = parse(NEXG.Sheets.getRecordFromRow(sheet, row));
      var data = NEXG.Validation.validateEntity(config.entity, payload, 'update', existing);
      if (!Object.keys(data).length) return NEXG.ok({ record: existing }, {}, ['No changes detected.']);

      data.updatedAt = new Date();
      data.updatedBy = NEXG.Security.getCurrentUserEmail();

      var stageChanged = false;
      var oldStage = existing.stage;
      if (config.entity === 'host' && data.stage && data.stage !== existing.stage) stageChanged = true;

      NEXG.Utilities.withLock(function() { NEXG.Sheets.updateRow(sheet, row, data); });

      var updated = parse(NEXG.Sheets.getRecordFromRow(sheet, row));
      audit('updated', updated);
      NEXG.EventBus.publish(config.eventPrefix + '.updated', updated);

      if (stageChanged) {
        NEXG.EventBus.publish(config.eventPrefix + '.stageChanged', {
          hostId: updated.hostId,
          oldStage: oldStage,
          newStage: updated.stage,
          updatedAt: updated.updatedAt
        });
      }
      NEXG.bustBootCache();
      return NEXG.ok({ record: updated });
    },

    findById: function(id) {
      requirePermission('view');
      ensureSchema();
      if (NEXG.Utilities.isBlank(id)) NEXG.throwError('ID_MISSING', 'Record ID is required.');
      var sheet = getSheet();
      var row = NEXG.Sheets.findRowById(sheet, config.idField, id);
      if (row < 0) return NEXG.fail('NOT_FOUND', config.name + ' record not found.');
      return NEXG.ok({ record: parse(NEXG.Sheets.getRecordFromRow(sheet, row)) });
    },

    findByField: function(field, value) {
      requirePermission('view');
      ensureSchema();
      if (NEXG.Utilities.isBlank(field)) NEXG.throwError('FIELD_MISSING', 'Field name is required.');
      var sheet = getSheet();
      var records = NEXG.Sheets.getRecords(sheet, { idField: config.idField });
      var matches = records.map(parse).filter(function(record) {
        return String(record[field]) === String(value);
      }).slice(0, NEXG.Config.searchLimit);
      return NEXG.ok({ records: matches, total: matches.length });
    },

    search: function(query, options) {
      requirePermission('view');
      ensureSchema();
      options = options || {};
      var sheet = getSheet();
      var records = NEXG.Sheets.getRecords(sheet, { idField: config.idField, limit: options.rawLimit || 1000 });
      var parsed = records.map(parse);
      var q = NEXG.Utilities.normalizeString(query).toLowerCase();
      var limit = options.limit || NEXG.Config.searchLimit;

      var results = parsed.filter(function(record) {
        if (!q) return true;
        return config.searchFields.some(function(field) {
          var value = record[field];
          return value !== undefined && value !== null && String(value).toLowerCase().indexOf(q) !== -1;
        });
      }).slice(0, limit);

      return NEXG.ok({ records: results, total: results.length });
    },

    archive: function(id) {
      requirePermission('archive');
      ensureSchema();
      if (NEXG.Utilities.isBlank(id)) NEXG.throwError('ID_MISSING', 'Record ID is required.');
      var sheet = getSheet();
      var row = NEXG.Sheets.findRowById(sheet, config.idField, id);
      if (row < 0) return NEXG.fail('NOT_FOUND', config.name + ' record not found.');

      var updates = { archivedAt: new Date(), archivedBy: NEXG.Security.getCurrentUserEmail() };
      if (config.entity === 'host') updates.lifecycleStatus = 'Archived';
      if (config.entity === 'settings') updates.active = false;

      NEXG.Utilities.withLock(function() { NEXG.Sheets.updateRow(sheet, row, updates); });
      var record = parse(NEXG.Sheets.getRecordFromRow(sheet, row));
      audit('archived', record);
      NEXG.EventBus.publish(config.eventPrefix + '.archived', record);
      NEXG.bustBootCache();
      return NEXG.ok({ record: record });
    }
  };
};