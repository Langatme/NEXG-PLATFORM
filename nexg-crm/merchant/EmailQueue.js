/*************************************************************
* NEXG EMAIL — QUEUE SERVICE
* File: EmailQueue.gs
*
* Sheet-backed outbound queue:
*  - enqueue() writes a Pending row in milliseconds (UI never blocks)
*  - processQueue() is run by a time-driven trigger (every 5 min)
*  - retries up to 3×, then marks Failed
*  - supports future scheduling (Scheduled For > now stays Pending)
*************************************************************/
const EmailQueue = {
  SHEET_NAME: 'Email_Queue',
  HEADERS: ['Queue ID', 'Status', 'Scheduled For', 'Template Key', 'Recipient', 'Data', 'Metadata', 'Attempts', 'Error', 'Created At'],
  MAX_PER_RUN: 25,
  MAX_ATTEMPTS: 3,

  /** Adds an email to the queue. sendAt optional (Date) for scheduled sends. */
  enqueue: function (templateKey, recipient, data, metadata, sendAt) {
    const sheet = this.sheet_();
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const queueId = 'EQ-' + Utilities.getUuid().slice(0, 8).toUpperCase();
      sheet.appendRow([
        queueId,
        'Pending',
        sendAt ? sendAt : new Date(),
        templateKey,
        recipient,
        JSON.stringify(data || {}),
        JSON.stringify(metadata || {}),
        0,
        '',
        new Date()
      ]);
      SpreadsheetApp.flush();
      return queueId;
    } finally {
      lock.releaseLock();
    }
  },

  /** Processes due Pending rows. Bound to a time-driven trigger. */
  processQueue: function () {
    const sheet = this.sheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { processed: 0 };

    const values = sheet.getRange(2, 1, lastRow - 1, this.HEADERS.length).getValues();
    const now = new Date();
    let processed = 0;

    for (let i = 0; i < values.length && processed < this.MAX_PER_RUN; i++) {
      const row = values[i];
      if (row[1] !== 'Pending') continue;

      const scheduled = row[2] ? new Date(row[2]) : now;
      if (scheduled > now) continue; // not due yet (scheduled sends)

      const rowIndex = i + 2;
      const queueId = row[0];
      const templateKey = row[3];
      const recipient = row[4];

      let data = {}, metadata = {};
      try { data = JSON.parse(row[5] || '{}'); } catch (e) {}
      try { metadata = JSON.parse(row[6] || '{}'); } catch (e) {}

      const attempts = Number(row[7]) + 1;
      processed++;

      try {
        // Safety: honour global TEST_MODE unless explicitly overridden
        metadata.sendMode = metadata.sendMode || (EmailConfig.isTestMode() ? 'test' : 'live');
        metadata.source = metadata.source || 'queue';
        metadata.queueId = queueId;

        const result = Email.send(templateKey, recipient, data, metadata);
        if (result.success) {
          sheet.getRange(rowIndex, 2).setValue('Sent');
          sheet.getRange(rowIndex, 8).setValue(attempts);
          sheet.getRange(rowIndex, 9).setValue('');
        } else {
          throw new Error(result.error || 'Send failed');
        }
      } catch (err) {
        sheet.getRange(rowIndex, 8).setValue(attempts);
        sheet.getRange(rowIndex, 9).setValue(String(err.message || err).slice(0, 500));
        sheet.getRange(rowIndex, 2).setValue(attempts >= this.MAX_ATTEMPTS ? 'Failed' : 'Pending');
      }
    }
    return { processed: processed };
  },

  sheet_: function () {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(this.SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(this.SHEET_NAME);
      sheet.appendRow(this.HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, this.HEADERS.length).setFontWeight('bold').setBackground('#111116').setFontColor('#d4af37');
    }
    return sheet;
  }
};

/** Time-driven trigger entry point. */
function runEmailQueueProcessor() {
  return EmailQueue.processQueue();
}

/** Run ONCE from the editor to install the 5-minute trigger. */
function installEmailQueueTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runEmailQueueProcessor') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runEmailQueueProcessor').timeBased().everyMinutes(5).create();
  return 'Installed: runEmailQueueProcessor every 5 minutes.';
}