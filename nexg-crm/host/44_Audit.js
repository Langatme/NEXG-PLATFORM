/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 44_Audit.gs
 *
 * Purpose:
 * - Audit trail through Activities
 */

var NEXG = NEXG || {};

NEXG.Audit = {

  log: function(entry) {
    entry = entry || {};

    return NEXG.Security.runAsSystem(function() {
      var payload = {
        hostId: entry.hostId || 'SYSTEM',
        type: entry.type || 'system.event',
        subtype: entry.subtype || '',
        status: entry.status || 'Completed',
        outcome: entry.outcome || '',
        subject: entry.subject || '',
        notes: entry.notes || '',
        metadataJson: entry.metadataJson || {}
      };

      return NEXG.getRepository('Activities').create(payload);
    });
  }
};