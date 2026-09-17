/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 43_IDGenerator.gs
 *
 * Purpose:
 * - Permanent ID generation
 * - Date-based sequence IDs
 */

var NEXG = NEXG || {};

NEXG.IdGenerator = {

  nextId: function(prefix) {
    if (!prefix) {
      NEXG.throwError('ID_PREFIX_MISSING', 'ID prefix is required.');
    }

    return NEXG.Utilities.withLock(function() {
      var now = new Date();
      var dateKey = Utilities.formatDate(now, NEXG.Config.timezone, 'yyyyMMdd');
      var propertyKey = 'NEXG_ID_SEQ_' + prefix + '_' + dateKey;

      var props = PropertiesService.getScriptProperties();
      var current = parseInt(props.getProperty(propertyKey) || '0', 10);
      var next = current + 1;

      props.setProperty(propertyKey, String(next));

      return prefix + '-' + dateKey + '-' + Utilities.formatString('%05d', next);
    });
  }
};