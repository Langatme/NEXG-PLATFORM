/**
 * ═══════════════════════════════════════════════════════════════════
 * NEXG Smart Panel – Server Data Access Layer (SheetData.gs)
 * Version: 2.1.0 | Date: 2025-07-24
 *
 * CHANGES:
 * - FIX (duplicate-const crash): The entire NEXG_EMAIL_* email data
 *   layer has been REMOVED from this file. It now lives in EmailData.gs.
 *   This resolves "SyntaxError: Identifier 'NEXG_EMAIL_SHEET_NAMES' has
 *   already been declared", which was breaking onOpen, the dashboard
 *   menu, and every server call.
 * - PRESERVED (per B9): every CRM function, getDashboardData,
 *   triggerEmailAutomation_, debugEmailLogs, and ALL public API names.
 * - triggerEmailAutomation_ still works — it calls EmailRouter, and the
 *   email read/write helpers it needs now resolve from EmailData.gs
 *   (same global scope).
 * ═══════════════════════════════════════════════════════════════════
 *
 * MERCHANTS SHEET COLUMNS (26):
 *  1: Merchant ID          14: Number Of Branches
 *  2: Business Name         15: Sales Representative
 *  3: Main Category         16: Lead Source
 *  4: Sub Category          17: Priority
 *  5: Contact Person        18: Pipeline Stage
 *  6: Position              19: Decision Maker
 *  7: Phone                 20: Decision
 *  8: Alternative Phone     21: Next Follow Up
 *  9: WhatsApp              22: Positive Feedback
 * 10: Email                 23: Negative Feedback
 * 11: Website               24: Notes
 * 12: Physical Address      25: Created At
 * 13: Branch Type           26: Updated At
 */

const COL = {
  MERCHANTS: {
    ID: 1, BUSINESS_NAME: 2, MAIN_CATEGORY: 3, SUB_CATEGORY: 4,
    CONTACT_PERSON: 5, POSITION: 6, PHONE: 7, ALT_PHONE: 8,
    WHATSAPP: 9, EMAIL: 10, WEBSITE: 11, ADDRESS: 12,
    BRANCH_TYPE: 13, NUM_BRANCHES: 14, SALES_REP: 15, LEAD_SOURCE: 16,
    PRIORITY: 17, PIPELINE: 18, DECISION_MAKER: 19, DECISION: 20,
    NEXT_FOLLOW_UP: 21, POSITIVE_FEEDBACK: 22, NEGATIVE_FEEDBACK: 23,
    NOTES: 24, CREATED_AT: 25, UPDATED_AT: 26
  },
  ACTIVITIES: {
    ID: 1, MERCHANT_ID: 2, BUSINESS_NAME: 3, DATE: 4, TIME: 5,
    ACTION: 6, CONTACT_METHOD: 7, CONTACT_PERSON: 8,
    PIPELINE_BEFORE: 9, PIPELINE_AFTER: 10, SUMMARY: 11,
    SALES_REP: 12, CREATED_AT: 13, USER_EMAIL: 14
  },
  MEETINGS: {
    ID: 1, MERCHANT_ID: 2, BUSINESS_NAME: 3, DATE: 4, TIME: 5,
    MEETING_TYPE: 6, CONTACT_PERSON: 7, SALES_REP: 8,
    RESULT: 9, NEXT_STEP: 10, NOTES: 11, CREATED_AT: 12
  },
  FEEDBACK: {
    ID: 1, MERCHANT_ID: 2, ACTIVITY_ID: 3, BUSINESS_NAME: 4,
    SALES_REP: 5, TYPE: 6, DISCUSSION_POINT: 7, DATE: 8, CREATED_AT: 9
  },
  FOLLOW_UPS: {
    ID: 1, MERCHANT_ID: 2, BUSINESS_NAME: 3, ACTIVITY_ID: 4,
    SALES_REP: 5, NEXT_FOLLOW_UP: 6, STATUS: 7, NOTES: 8, CREATED_AT: 9
  }
};

const SHEET_NAMES = {
  MERCHANTS:  "Merchants",
  ACTIVITIES: "Activities",
  MEETINGS:   "Meetings",
  FEEDBACK:   "Feedback",
  FOLLOW_UPS: "Follow Ups"
};

// ─── Helpers & Date Sanitization ──────────────────────────────────
function getSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function sanitizeValue_(val) {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  }
  return String(val);
}

function getTimestamp_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
}

function getDateStr_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function getTimeStr_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm");
}

function generateId_(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function generateMerchantId_(mainCategory, subCategory, sheet) {
  const catMap = {
    "Delivery": "DEL", "Concierge": "CON", "Mobility": "MOB",
    "Wellness": "WEL", "Experiences": "EXP"
  };
  const subMap = {
    "Restaurants": "RES", "Groceries": "GRO", "Retail": "RET", "Pharmacy": "PHA",
    "Laundry": "LAU", "Dry Cleaning": "DRC", "Housekeeping": "HOU", "Special Requests": "SPR",
    "Airport Transfer": "AIR", "Car Hire": "CHR", "Car Wash": "CWA", "Chauffeur": "CHA",
    "Spa": "SPA", "Massage": "MAS", "Beauty": "BEA", "Fitness": "FIT",
    "Tours": "TOU", "Safaris": "SAF", "Events": "EVE", "Photography": "PHO"
  };
  const catCode = catMap[mainCategory] || "GEN";
  const subCode = subMap[subCategory] || "GEN";
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const nextNum = String(lastRow).padStart(6, '0');
  return "NXG-" + catCode + "-" + subCode + "-" + nextNum;
}

function findMerchantRow_(merchantId) {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (!sheet) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, COL.MERCHANTS.ID, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (sanitizeValue_(ids[i][0]) === String(merchantId)) return i + 2;
  }
  return -1;
}

function getUserEmail_() {
  let email = "";
  try { email = Session.getActiveUser().getEmail(); } catch (e) { email = ""; }
  if (!email) {
    try { email = Session.getEffectiveUser().getEmail(); } catch (e) { email = ""; }
  }
  return email || "unknown";
}

function ensureActivityUserEmailColumn_() {
  const sheet = getSheet_(SHEET_NAMES.ACTIVITIES);
  if (!sheet) return;
  while (sheet.getMaxColumns() < 14) {
    sheet.insertColumnAfter(sheet.getMaxColumns());
  }
  const header = sheet.getRange(1, 14).getValue();
  if (header !== "User Email") {
    sheet.getRange(1, 14).setValue("User Email");
  }
}

function appendActivity_(data) {
  const sheet = getSheet_(SHEET_NAMES.ACTIVITIES);
  if (!sheet) return "";
  ensureActivityUserEmailColumn_();
  const actId = data.id || generateId_("ACT");
  const email = data.userEmail || getUserEmail_();
  sheet.appendRow([
    actId, data.merchantId || "", data.businessName || "",
    data.date || getDateStr_(), data.time || getTimeStr_(),
    data.action || "Activity", data.contactMethod || "", data.contactPerson || "",
    data.pipelineBefore || "", data.pipelineAfter || "", data.summary || "",
    data.salesRep || "", data.createdAt || getTimestamp_()
  ]);
  sheet.getRange(sheet.getLastRow(), COL.ACTIVITIES.USER_EMAIL).setValue(email);
  bustMerchantCache_(data.merchantId);
  return actId;
}

// ─── Setup Sheet Data Validation Rules (Dropdowns) ───────────────
function setupSheetDataValidationAndHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let mchSheet = ss.getSheetByName(SHEET_NAMES.MERCHANTS);
  if (!mchSheet) mchSheet = ss.insertSheet(SHEET_NAMES.MERCHANTS);

  const headers = [
    "Merchant ID", "Business Name", "Main Category", "Sub Category",
    "Contact Person", "Position", "Phone", "Alternative Phone",
    "WhatsApp", "Email", "Website", "Physical Address",
    "Branch Type", "Number Of Branches", "Sales Representative", "Lead Source",
    "Priority", "Pipeline Stage", "Decision Maker", "Decision",
    "Next Follow Up", "Positive Feedback", "Negative Feedback", "Notes",
    "Created At", "Updated At"
  ];
  if (mchSheet.getLastRow() < 1) {
    mchSheet.appendRow(headers);
    mchSheet.getRange(1, 1, 1, 26).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  }

  [SHEET_NAMES.ACTIVITIES, SHEET_NAMES.MEETINGS, SHEET_NAMES.FEEDBACK, SHEET_NAMES.FOLLOW_UPS].forEach(sName => {
    if (!ss.getSheetByName(sName)) {
      const s = ss.insertSheet(sName);
      if (sName === SHEET_NAMES.ACTIVITIES) {
        s.appendRow(["Activity ID", "Merchant ID", "Business Name", "Date", "Time", "Action", "Contact Method", "Contact Person", "Pipeline Before", "Pipeline After", "Summary", "Sales Representative", "Created At"]);
      }
      if (sName === SHEET_NAMES.MEETINGS) {
        s.appendRow(["Meeting ID", "Merchant ID", "Business Name", "Date", "Time", "Meeting Type", "Contact Person", "Sales Representative", "Result", "Next Step", "Notes", "Created At"]);
      }
      if (sName === SHEET_NAMES.FEEDBACK) {
        s.appendRow(["Feedback ID", "Merchant ID", "Activity ID", "Business Name", "Sales Representative", "Type", "Discussion Point", "Date", "Created At"]);
      }
      if (sName === SHEET_NAMES.FOLLOW_UPS) {
        s.appendRow(["Follow Up ID", "Merchant ID", "Business Name", "Activity ID", "Sales Representative", "Next Follow Up", "Status", "Notes", "Created At"]);
      }
    }
  });

  const numRows = 999;
  const mainCatRule = SpreadsheetApp.newDataValidation().requireValueInList(["Delivery", "Concierge", "Mobility", "Wellness", "Experiences"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.MAIN_CATEGORY, numRows, 1).setDataValidation(mainCatRule);

  const subCatRule = SpreadsheetApp.newDataValidation().requireValueInList(["Restaurants", "Groceries", "Retail", "Pharmacy", "Laundry", "Dry Cleaning", "Housekeeping", "Special Requests", "Airport Transfer", "Car Hire", "Car Wash", "Chauffeur", "Spa", "Massage", "Beauty", "Fitness", "Tours", "Safaris", "Events", "Photography"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.SUB_CATEGORY, numRows, 1).setDataValidation(subCatRule);

  const branchRule = SpreadsheetApp.newDataValidation().requireValueInList(["Single", "Multi Branch"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.BRANCH_TYPE, numRows, 1).setDataValidation(branchRule);

  const sourceRule = SpreadsheetApp.newDataValidation().requireValueInList(["Direct Research", "Referral", "Inbound Inquiry", "Field Scouting", "Social Media", "Exhibition / Event"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.LEAD_SOURCE, numRows, 1).setDataValidation(sourceRule);

  const priorityRule = SpreadsheetApp.newDataValidation().requireValueInList(["High", "Medium", "Low"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.PRIORITY, numRows, 1).setDataValidation(priorityRule);

  const pipelineRule = SpreadsheetApp.newDataValidation().requireValueInList(["Lead", "Contact", "Follow Up", "Meeting", "Demo", "Proposal", "Negotiation", "Contract", "Onboarding", "Live", "Lost"], true).setAllowInvalid(true).build();
  mchSheet.getRange(2, COL.MERCHANTS.PIPELINE, numRows, 1).setDataValidation(pipelineRule);

  ss.toast("Data Validation Rules Applied Successfully!", "✅ Sheet Config", 5);
}

function beautifyAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const HEADER_BG = "#111116", HEADER_FG = "#d4af37", GRID_COLOR = "#e8e8ec", ALT_ROW_BG = "#f8f8fa", WHITE = "#ffffff";
  const sheetConfigs = {
    "Merchants": { widths: {1:140,2:180,3:110,4:120,5:130,6:110,7:130,8:130,9:130,10:170,11:150,12:150,13:100,14:90,15:140,16:120,17:80,18:110,19:130,20:120,21:130,22:200,23:200,24:200,25:150,26:150}, dateCols: [25, 26], pipelineCol: 18 },
    "Activities": { widths: {1:140,2:140,3:160,4:100,5:80,6:110,7:110,8:130,9:110,10:110,11:280,12:140,13:150,14:180}, dateCols: [4, 13], pipelineCol: null },
    "Meetings": { widths: {1:140,2:140,3:160,4:100,5:80,6:110,7:130,8:140,9:140,10:140,11:250,12:150}, dateCols: [4, 12], pipelineCol: null },
    "Feedback": { widths: {1:140,2:140,3:140,4:160,5:140,6:90,7:300,8:100,9:150}, dateCols: [8, 9], pipelineCol: null },
    "Follow Ups": { widths: {1:140,2:140,3:160,4:140,5:140,6:130,7:90,8:250,9:150}, dateCols: [6, 9], pipelineCol: null }
  };
  const stageColors = {
    "Lead": { bg:"#f3f4f6", fg:"#6b7280" }, "Contact": { bg:"#eff6ff", fg:"#2563eb" },
    "Follow Up": { bg:"#fefce8", fg:"#ca8a04" }, "Meeting": { bg:"#f0fdf4", fg:"#16a34a" },
    "Demo": { bg:"#faf5ff", fg:"#9333ea" }, "Proposal": { bg:"#fff7ed", fg:"#ea580c" },
    "Negotiation": { bg:"#fef2f2", fg:"#dc2626" }, "Contract": { bg:"#ecfeff", fg:"#0891b2" },
    "Onboarding": { bg:"#f0fdfa", fg:"#0d9488" }, "Live": { bg:"#d4af37", fg:"#000000" },
    "Lost": { bg:"#fecaca", fg:"#991b1b" }
  };
  let done = 0, failed = [];
  Object.keys(sheetConfigs).forEach(function(name) {
    try {
      const sheet = ss.getSheetByName(name);
      if (!sheet) { failed.push(name + " (missing)"); return; }
      const cfg = sheetConfigs[name];
      const lastRow = Math.max(sheet.getLastRow(), 1);
      const lastCol = sheet.getMaxColumns();
      Object.keys(cfg.widths).forEach(function(col) {
        if (Number(col) <= lastCol) sheet.setColumnWidth(Number(col), cfg.widths[col]);
      });
      if (lastCol > 0) {
        sheet.getRange(1, 1, 1, lastCol).setBackground(HEADER_BG).setFontColor(HEADER_FG).setFontWeight("bold").setFontFamily("Nunito, sans-serif").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
        sheet.setRowHeight(1, 36);
      }
      sheet.setFrozenRows(1);
      if (lastRow > 1 && lastCol > 0) {
        const body = sheet.getRange(2, 1, lastRow - 1, lastCol);
        body.setFontFamily("Nunito, sans-serif").setFontSize(10).setVerticalAlignment("middle").setWrap(false).setBorder(true, true, true, true, true, true, GRID_COLOR, SpreadsheetApp.BorderStyle.SOLID);
        for (var r = 2; r <= lastRow; r++) {
          sheet.getRange(r, 1, 1, lastCol).setBackground(r % 2 === 0 ? ALT_ROW_BG : WHITE);
        }
      }
      if (cfg.dateCols && lastRow > 1) {
        cfg.dateCols.forEach(function(col) {
          if (col <= lastCol) sheet.getRange(2, col, lastRow - 1, 1).setNumberFormat("yyyy-mm-dd hh:mm");
        });
      }
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 1).setFontFamily("SF Mono, Fira Code, monospace").setFontSize(9);
      }
      if (cfg.pipelineCol && lastRow > 1) {
        var rules = sheet.getConditionalFormatRules();
        var rng = sheet.getRange(2, cfg.pipelineCol, lastRow - 1, 1);
        Object.keys(stageColors).forEach(function(stage) {
          var sc = stageColors[stage];
          rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(stage).setBackground(sc.bg).setFontColor(sc.fg).setBold(true).setRanges([rng]).build());
        });
        sheet.setConditionalFormatRules(rules);
      }
      done++;
    } catch (e) {
      failed.push(name + " (" + e.message + ")");
      Logger.log("Beautify failed on " + name + ": " + e.message);
    }
  });
  var msg = done + " sheet(s) beautified.";
  if (failed.length) msg += " Skipped: " + failed.join(", ");
  ss.toast(msg, "🎨 NEXG Style", 6);
}

// ─── Read Merchant Data ───────────────────────────────────────────
function readMerchantRow_(sheet, row) {
  const vals = sheet.getRange(row, 1, 1, 26).getValues()[0];
  return {
    id: sanitizeValue_(vals[COL.MERCHANTS.ID - 1]),
    businessName: sanitizeValue_(vals[COL.MERCHANTS.BUSINESS_NAME - 1]),
    mainCategory: sanitizeValue_(vals[COL.MERCHANTS.MAIN_CATEGORY - 1]),
    subCategory: sanitizeValue_(vals[COL.MERCHANTS.SUB_CATEGORY - 1]),
    contactPerson: sanitizeValue_(vals[COL.MERCHANTS.CONTACT_PERSON - 1]),
    position: sanitizeValue_(vals[COL.MERCHANTS.POSITION - 1]),
    phone: sanitizeValue_(vals[COL.MERCHANTS.PHONE - 1]),
    altPhone: sanitizeValue_(vals[COL.MERCHANTS.ALT_PHONE - 1]),
    whatsapp: sanitizeValue_(vals[COL.MERCHANTS.WHATSAPP - 1]),
    email: sanitizeValue_(vals[COL.MERCHANTS.EMAIL - 1]),
    website: sanitizeValue_(vals[COL.MERCHANTS.WEBSITE - 1]),
    address: sanitizeValue_(vals[COL.MERCHANTS.ADDRESS - 1]),
    branchType: sanitizeValue_(vals[COL.MERCHANTS.BRANCH_TYPE - 1]) || "Single",
    branches: Number(vals[COL.MERCHANTS.NUM_BRANCHES - 1]) || 1,
    salesRep: sanitizeValue_(vals[COL.MERCHANTS.SALES_REP - 1]),
    leadSource: sanitizeValue_(vals[COL.MERCHANTS.LEAD_SOURCE - 1]),
    priority: sanitizeValue_(vals[COL.MERCHANTS.PRIORITY - 1]) || "Medium",
    pipeline: sanitizeValue_(vals[COL.MERCHANTS.PIPELINE - 1]) || "Lead",
    decisionMaker: sanitizeValue_(vals[COL.MERCHANTS.DECISION_MAKER - 1]),
    decision: sanitizeValue_(vals[COL.MERCHANTS.DECISION - 1]),
    nextFollowUp: sanitizeValue_(vals[COL.MERCHANTS.NEXT_FOLLOW_UP - 1]),
    notes: sanitizeValue_(vals[COL.MERCHANTS.NOTES - 1])
  };
}

function getActivitiesForMerchant_(merchantId) {
  const sheet = getSheet_(SHEET_NAMES.ACTIVITIES);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
  const results = [];
  data.forEach(row => {
    if (sanitizeValue_(row[COL.ACTIVITIES.MERCHANT_ID - 1]) === String(merchantId)) {
      const dt = sanitizeValue_(row[COL.ACTIVITIES.DATE - 1]);
      const tm = sanitizeValue_(row[COL.ACTIVITIES.TIME - 1]);
      results.push({
        id: sanitizeValue_(row[COL.ACTIVITIES.ID - 1]),
        merchantId: sanitizeValue_(row[COL.ACTIVITIES.MERCHANT_ID - 1]),
        date: dt, time: tm, timestamp: dt + " " + tm,
        action: sanitizeValue_(row[COL.ACTIVITIES.ACTION - 1]),
        type: sanitizeValue_(row[COL.ACTIVITIES.ACTION - 1]),
        contactMethod: sanitizeValue_(row[COL.ACTIVITIES.CONTACT_METHOD - 1]),
        contactPerson: sanitizeValue_(row[COL.ACTIVITIES.CONTACT_PERSON - 1]),
        pipelineBefore: sanitizeValue_(row[COL.ACTIVITIES.PIPELINE_BEFORE - 1]),
        pipelineAfter: sanitizeValue_(row[COL.ACTIVITIES.PIPELINE_AFTER - 1]),
        summary: sanitizeValue_(row[COL.ACTIVITIES.SUMMARY - 1]),
        notes: sanitizeValue_(row[COL.ACTIVITIES.SUMMARY - 1]),
        salesRep: sanitizeValue_(row[COL.ACTIVITIES.SALES_REP - 1]),
        rep: sanitizeValue_(row[COL.ACTIVITIES.SALES_REP - 1])
      });
    }
  });
  return results.reverse();
}

function getMeetingsForMerchant_(merchantId) {
  const sheet = getSheet_(SHEET_NAMES.MEETINGS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  const results = [];
  data.forEach(row => {
    if (sanitizeValue_(row[COL.MEETINGS.MERCHANT_ID - 1]) === String(merchantId)) {
      results.push({
        id: sanitizeValue_(row[COL.MEETINGS.ID - 1]),
        merchantId: sanitizeValue_(row[COL.MEETINGS.MERCHANT_ID - 1]),
        date: sanitizeValue_(row[COL.MEETINGS.DATE - 1]),
        time: sanitizeValue_(row[COL.MEETINGS.TIME - 1]),
        type: sanitizeValue_(row[COL.MEETINGS.MEETING_TYPE - 1]),
        meetingType: sanitizeValue_(row[COL.MEETINGS.MEETING_TYPE - 1]),
        contactPerson: sanitizeValue_(row[COL.MEETINGS.CONTACT_PERSON - 1]),
        salesRep: sanitizeValue_(row[COL.MEETINGS.SALES_REP - 1]),
        result: sanitizeValue_(row[COL.MEETINGS.RESULT - 1]),
        outcome: sanitizeValue_(row[COL.MEETINGS.RESULT - 1]),
        nextStep: sanitizeValue_(row[COL.MEETINGS.NEXT_STEP - 1]),
        notes: sanitizeValue_(row[COL.MEETINGS.NOTES - 1])
      });
    }
  });
  return results.reverse();
}

function getFeedbackForMerchant_(merchantId) {
  const sheet = getSheet_(SHEET_NAMES.FEEDBACK);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const results = [];
  data.forEach(row => {
    if (sanitizeValue_(row[COL.FEEDBACK.MERCHANT_ID - 1]) === String(merchantId)) {
      results.push({
        id: sanitizeValue_(row[COL.FEEDBACK.ID - 1]),
        activityId: sanitizeValue_(row[COL.FEEDBACK.ACTIVITY_ID - 1]),
        sentiment: sanitizeValue_(row[COL.FEEDBACK.TYPE - 1]) || "Neutral",
        type: sanitizeValue_(row[COL.FEEDBACK.TYPE - 1]) || "Neutral",
        text: sanitizeValue_(row[COL.FEEDBACK.DISCUSSION_POINT - 1]),
        point: sanitizeValue_(row[COL.FEEDBACK.DISCUSSION_POINT - 1]),
        date: sanitizeValue_(row[COL.FEEDBACK.DATE - 1]),
        timestamp: sanitizeValue_(row[COL.FEEDBACK.DATE - 1])
      });
    }
  });
  return results.reverse();
}

function getFollowUpsForMerchant_(merchantId) {
  const sheet = getSheet_(SHEET_NAMES.FOLLOW_UPS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const results = [];
  data.forEach(row => {
    if (sanitizeValue_(row[COL.FOLLOW_UPS.MERCHANT_ID - 1]) === String(merchantId)) {
      results.push({
        id: sanitizeValue_(row[COL.FOLLOW_UPS.ID - 1]),
        activityId: sanitizeValue_(row[COL.FOLLOW_UPS.ACTIVITY_ID - 1]),
        date: sanitizeValue_(row[COL.FOLLOW_UPS.NEXT_FOLLOW_UP - 1]),
        status: sanitizeValue_(row[COL.FOLLOW_UPS.STATUS - 1]) || "Pending",
        reason: sanitizeValue_(row[COL.FOLLOW_UPS.NOTES - 1]),
        notes: sanitizeValue_(row[COL.FOLLOW_UPS.NOTES - 1])
      });
    }
  });
  return results.reverse();
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
function getActiveMerchantProfileForPanel() {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (!sheet) return null;
  const activeCell = SpreadsheetApp.getActiveSpreadsheet().getActiveCell();
  if (!activeCell) return null;
  const activeRow = activeCell.getRow();
  if (activeRow < 2 || activeRow > sheet.getLastRow()) return null;
  const merchantId = sanitizeValue_(sheet.getRange(activeRow, COL.MERCHANTS.ID).getValue());
  if (!merchantId) return null;
  return getMerchantProfileForPanel(merchantId);
}

function getActiveMerchantRowData() {
  const profile = getActiveMerchantProfileForPanel();
  if (!profile) return null;
  const m = profile.merchant;
  m.vertical = m.mainCategory;
  m.region = m.address;
  m.status = m.pipeline;
  m.nextAction = m.nextFollowUp;
  m.activities = profile.activities;
  m.meetings = profile.meetings;
  m.followUps = profile.followUps;
  m.discussionPoints = profile.feedback;
  return m;
}

/* ─── Panel profile cache (45s, per merchant) — busted by writers below ─── */
function mchCacheKey_(merchantId) { return 'nx_mch_' + String(merchantId || ''); }
function bustMerchantCache_(merchantId) {
  try { if (merchantId) CacheService.getUserCache().remove(mchCacheKey_(merchantId)); } catch (e) {}
}
function getMerchantProfileForPanel(merchantId) {
  const key = mchCacheKey_(merchantId);
  try {
    const hit = CacheService.getUserCache().get(key);
    if (hit) { const p = JSON.parse(hit); if (p) return p; }
  } catch (e) {}
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (!sheet) return null;
  const row = findMerchantRow_(merchantId);
  if (row < 2) return null;
  const profile = buildProfile_(sheet, row, merchantId);
  try { CacheService.getUserCache().put(key, JSON.stringify(profile), 45); } catch (e) {}
  return profile;
}

function buildProfile_(sheet, row, merchantId) {
  const merchant = readMerchantRow_(sheet, row);
  merchant.row = row;
  return {
    merchant: merchant,
    activities: getActivitiesForMerchant_(merchantId),
    meetings: getMeetingsForMerchant_(merchantId),
    feedback: getFeedbackForMerchant_(merchantId),
    followUps: getFollowUpsForMerchant_(merchantId),
    stats: { totalActivities: 0, totalMeetings: 0, pendingFollowUps: 0, totalFeedback: 0 }
  };
}

function getAllMerchantsForPanel() {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, 26).getValues();
  return data.map((row, idx) => ({
    id: sanitizeValue_(row[COL.MERCHANTS.ID - 1]),
    name: sanitizeValue_(row[COL.MERCHANTS.BUSINESS_NAME - 1]),
    mainCategory: sanitizeValue_(row[COL.MERCHANTS.MAIN_CATEGORY - 1]),
    subCategory: sanitizeValue_(row[COL.MERCHANTS.SUB_CATEGORY - 1]),
    vertical: sanitizeValue_(row[COL.MERCHANTS.MAIN_CATEGORY - 1]),
    region: sanitizeValue_(row[COL.MERCHANTS.ADDRESS - 1]),
    branchType: sanitizeValue_(row[COL.MERCHANTS.BRANCH_TYPE - 1]) || "Single",
    branches: Number(row[COL.MERCHANTS.NUM_BRANCHES - 1]) || 1,
    pipeline: sanitizeValue_(row[COL.MERCHANTS.PIPELINE - 1]) || "Lead",
    status: sanitizeValue_(row[COL.MERCHANTS.PIPELINE - 1]) || "Lead",
    salesRep: sanitizeValue_(row[COL.MERCHANTS.SALES_REP - 1]),
    phone: sanitizeValue_(row[COL.MERCHANTS.PHONE - 1]),
    email: sanitizeValue_(row[COL.MERCHANTS.EMAIL - 1]),
    row: idx + 2
  }));
}

function getAllMerchantsData() {
  return getAllMerchantsForPanel();
}

function createMerchantFromPanel(data) {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (!sheet) throw new Error("Merchants sheet not found");
  const mainCategory = data.mainCategory || data.vertical || "Delivery";
  const subCategory = data.subCategory || "Restaurants";
  const businessName = data.businessName || data.name || "";
  const salesRep = data.salesRepresentative || data.salesRep || "Peter Kimani";
  const leadSource = data.leadSource || data.source || "Direct Research";
  const merchantId = generateMerchantId_(mainCategory, subCategory, sheet);
  const now = getTimestamp_();
  const newRow = new Array(26).fill("");
  newRow[COL.MERCHANTS.ID - 1] = merchantId;
  newRow[COL.MERCHANTS.BUSINESS_NAME - 1] = businessName;
  newRow[COL.MERCHANTS.MAIN_CATEGORY - 1] = mainCategory;
  newRow[COL.MERCHANTS.SUB_CATEGORY - 1] = subCategory;
  newRow[COL.MERCHANTS.CONTACT_PERSON - 1] = data.contactPerson || "";
  newRow[COL.MERCHANTS.POSITION - 1] = data.position || "";
  newRow[COL.MERCHANTS.PHONE - 1] = data.phone || "";
  newRow[COL.MERCHANTS.ALT_PHONE - 1] = data.altPhone || "";
  newRow[COL.MERCHANTS.WHATSAPP - 1] = data.whatsapp || "";
  newRow[COL.MERCHANTS.EMAIL - 1] = data.email || "";
  newRow[COL.MERCHANTS.WEBSITE - 1] = data.website || "";
  newRow[COL.MERCHANTS.ADDRESS - 1] = data.address || data.region || "";
  newRow[COL.MERCHANTS.BRANCH_TYPE - 1] = data.branchType || "Single";
  newRow[COL.MERCHANTS.NUM_BRANCHES - 1] = Number(data.numBranches || data.branches) || 1;
  newRow[COL.MERCHANTS.SALES_REP - 1] = salesRep;
  newRow[COL.MERCHANTS.LEAD_SOURCE - 1] = leadSource;
  newRow[COL.MERCHANTS.PRIORITY - 1] = data.priority || "Medium";
  newRow[COL.MERCHANTS.PIPELINE - 1] = "Lead";
  newRow[COL.MERCHANTS.CREATED_AT - 1] = now;
  newRow[COL.MERCHANTS.UPDATED_AT - 1] = now;
  sheet.appendRow(newRow);
  appendActivity_({
    merchantId: merchantId, businessName: businessName, action: "Merchant Created",
    contactMethod: "System", contactPerson: data.contactPerson || "",
    pipelineBefore: "", pipelineAfter: "Lead",
    summary: "Merchant account created. Category: " + mainCategory + " / " + subCategory + ". Source: " + leadSource + ". Rep: " + salesRep + ".",
    salesRep: salesRep
  });
  bustMerchantCache_(merchantId);
  return merchantId;
}

function createNewMerchant(name, vertical, email, region, source) {
  const mId = createMerchantFromPanel({ name: name, businessName: name, mainCategory: vertical, email: email, address: region, leadSource: source });
  return { status: "success", id: mId };
}

function updateMerchantFromPanel(a, b) {
  var merchantId, updates;
  if (a && typeof a === "object" && a.merchantId !== undefined) {
    merchantId = a.merchantId;
    updates = a.updates || b || {};
  } else {
    merchantId = a;
    updates = b || {};
  }
  var s = getSheet_(SHEET_NAMES.MERCHANTS);
  var row = findMerchantRow_(merchantId);
  if (row < 2) throw new Error("Merchant not found: " + merchantId);
  var f2c = {
    "Business Name": COL.MERCHANTS.BUSINESS_NAME, "Main Category": COL.MERCHANTS.MAIN_CATEGORY,
    "Sub Category": COL.MERCHANTS.SUB_CATEGORY, "Contact Person": COL.MERCHANTS.CONTACT_PERSON,
    "Position": COL.MERCHANTS.POSITION, "Phone": COL.MERCHANTS.PHONE,
    "Alternative Phone": COL.MERCHANTS.ALT_PHONE, "WhatsApp": COL.MERCHANTS.WHATSAPP,
    "Email": COL.MERCHANTS.EMAIL, "Website": COL.MERCHANTS.WEBSITE,
    "Physical Address": COL.MERCHANTS.ADDRESS, "Branch Type": COL.MERCHANTS.BRANCH_TYPE,
    "Number Of Branches": COL.MERCHANTS.NUM_BRANCHES, "Sales Representative": COL.MERCHANTS.SALES_REP,
    "Lead Source": COL.MERCHANTS.LEAD_SOURCE, "Priority": COL.MERCHANTS.PRIORITY,
    "Pipeline Stage": COL.MERCHANTS.PIPELINE, "Decision Maker": COL.MERCHANTS.DECISION_MAKER,
    "Decision": COL.MERCHANTS.DECISION, "Next Follow Up": COL.MERCHANTS.NEXT_FOLLOW_UP,
    "Notes": COL.MERCHANTS.NOTES
  };
  var newName = null;
  for (var f in updates) {
    if (!updates.hasOwnProperty(f)) continue;
    var v = updates[f];
    var c = f2c[f];
    if (c && v !== undefined && v !== null) {
      s.getRange(row, c).setValue(v);
      if (f === "Business Name") newName = v;
    }
  }
  s.getRange(row, COL.MERCHANTS.UPDATED_AT).setValue(getTimestamp_());
  if (newName !== null) cascadeBusinessName_(merchantId, newName);
  bustMerchantCache_(merchantId);
  return { status: "success" };
}

function cascadeBusinessName_(merchantId, newName) {
  var mid = String(merchantId);
  var targets = [
    [SHEET_NAMES.ACTIVITIES, COL.ACTIVITIES.BUSINESS_NAME, COL.ACTIVITIES.MERCHANT_ID],
    [SHEET_NAMES.MEETINGS, COL.MEETINGS.BUSINESS_NAME, COL.MEETINGS.MERCHANT_ID],
    [SHEET_NAMES.FEEDBACK, COL.FEEDBACK.BUSINESS_NAME, COL.FEEDBACK.MERCHANT_ID],
    [SHEET_NAMES.FOLLOW_UPS, COL.FOLLOW_UPS.BUSINESS_NAME, COL.FOLLOW_UPS.MERCHANT_ID]
  ];
  targets.forEach(function(t) {
    var sh = getSheet_(t[0]);
    if (!sh || sh.getLastRow() < 2) return;
    var lr = sh.getLastRow();
    var ids = sh.getRange(2, t[2], lr - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (sanitizeValue_(ids[i][0]) === mid) sh.getRange(i + 2, t[1]).setValue(newName);
    }
  });
}

function updateMerchantDetails(rowIndex, name, vertical, email, region) {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (rowIndex < 2 || rowIndex > sheet.getLastRow()) return { status: "error" };
  const mId = sanitizeValue_(sheet.getRange(rowIndex, COL.MERCHANTS.ID).getValue());
  return updateMerchantFromPanel(mId, { "Business Name": name, "Main Category": vertical, "Email": email, "Physical Address": region });
}

function updateMerchantPipeline_(merchantId, newStage) {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const row = findMerchantRow_(merchantId);
  if (row < 2) return;
  sheet.getRange(row, COL.MERCHANTS.PIPELINE).setValue(newStage);
  sheet.getRange(row, COL.MERCHANTS.UPDATED_AT).setValue(getTimestamp_());
  bustMerchantCache_(merchantId);
}

function updateSheetPipelineStage(rowIndex, newStage) {
  const sheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (rowIndex >= 2 && rowIndex <= sheet.getLastRow()) {
    sheet.getRange(rowIndex, COL.MERCHANTS.PIPELINE).setValue(newStage);
    sheet.getRange(rowIndex, COL.MERCHANTS.UPDATED_AT).setValue(getTimestamp_());
    bustMerchantCache_(sanitizeValue_(sheet.getRange(rowIndex, COL.MERCHANTS.ID).getValue()));
  }
  return { status: "success", stage: newStage, row: rowIndex };
}

// ─── Save Points List ─────────────────────────────────────────────
function savePointsList_(merchantId, businessName, salesRep, points) {
  if (!points || !points.length) return;
  const fbSheet = getSheet_(SHEET_NAMES.FEEDBACK);
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(merchantId);
  const dateStr = getDateStr_();
  const now = getTimestamp_();
  const pipelineBefore = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.PIPELINE).getValue()) : "";
  points.forEach(p => {
    const fbId = generateId_("FB");
    const sentiment = p.sentiment || "Neutral";
    const text = p.text || p.point || "";
    fbSheet.appendRow([fbId, merchantId, "", businessName, salesRep, sentiment, text, dateStr, now]);
    appendActivity_({
      merchantId: merchantId, businessName: businessName, action: "Feedback",
      contactMethod: "Feedback", contactPerson: "", pipelineBefore: pipelineBefore,
      pipelineAfter: pipelineBefore, summary: "Feedback ID: " + fbId + " | " + sentiment + ": " + text, salesRep: salesRep
    });
    if (mchRow >= 2) {
      let targetCol;
      if (sentiment === "Positive") targetCol = COL.MERCHANTS.POSITIVE_FEEDBACK;
      else if (sentiment === "Negative") targetCol = COL.MERCHANTS.NEGATIVE_FEEDBACK;
      else targetCol = COL.MERCHANTS.NOTES;
      const existing = sanitizeValue_(mchSheet.getRange(mchRow, targetCol).getValue());
      const line = "• [" + now + "] " + sentiment + ": " + text;
      const updated = existing ? existing + "\n" + line : line;
      mchSheet.getRange(mchRow, targetCol).setValue(updated);
      mchSheet.getRange(mchRow, COL.MERCHANTS.UPDATED_AT).setValue(getTimestamp_());
    }
  });
}

// ─── Log Contact ──────────────────────────────────────────────────
function logContactFromPanel(data) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(data.merchantId);
  const businessName = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.BUSINESS_NAME).getValue()) : "";
  const salesRep = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.SALES_REP).getValue()) : "";
  const pipelineBefore = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.PIPELINE).getValue()) : "Lead";
  if (mchRow >= 2 && data.contactPerson) {
    mchSheet.getRange(mchRow, COL.MERCHANTS.CONTACT_PERSON).setValue(data.contactPerson);
  }
  const actId = appendActivity_({
    merchantId: data.merchantId, businessName: businessName, action: "Contact",
    contactMethod: data.contactMethod || "", contactPerson: data.contactPerson || "",
    pipelineBefore: pipelineBefore, pipelineAfter: "Contact", summary: data.summary || "", salesRep: salesRep
  });
  updateMerchantPipeline_(data.merchantId, "Contact");
  if (data.createFollowUp) {
    const fuSheet = getSheet_(SHEET_NAMES.FOLLOW_UPS);
    if (fuSheet) {
      fuSheet.appendRow([generateId_("FU"), data.merchantId, businessName, actId, salesRep, data.followUpDate || "", "Pending", data.followUpNotes || "", getTimestamp_()]);
      if (mchRow >= 2 && data.followUpDate) {
        mchSheet.getRange(mchRow, COL.MERCHANTS.NEXT_FOLLOW_UP).setValue(data.followUpDate);
      }
    }
  }
  if (data.discussionPoints && data.discussionPoints.length) {
    savePointsList_(data.merchantId, businessName, salesRep, data.discussionPoints);
  }
  return actId;
}

// ─── Log Activity (generic) ───────────────────────────────────────
function logActivityFromPanel(data) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(data.merchantId);
  const businessName = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.BUSINESS_NAME).getValue()) : "";
  const salesRep = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.SALES_REP).getValue()) : "";
  const pipelineBefore = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.PIPELINE).getValue()) : "Lead";
  const actId = appendActivity_({
    merchantId: data.merchantId, businessName: businessName, action: data.action || "General",
    contactMethod: data.contactMethod || "", contactPerson: data.contactPerson || "",
    pipelineBefore: pipelineBefore, pipelineAfter: data.action || pipelineBefore, summary: data.summary || "", salesRep: salesRep
  });
  if (data.action) {
    updateMerchantPipeline_(data.merchantId, data.action);
  }
  if (data.discussionPoints) {
    savePointsList_(data.merchantId, businessName, salesRep, data.discussionPoints);
  }
  if (data.sendEmail) triggerEmailAutomation_(data.action, data.merchantId, data);
  return actId;
}

// ─── Log Follow Up ────────────────────────────────────────────────
function logFollowUpFromPanel(data) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(data.merchantId);
  const businessName = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.BUSINESS_NAME).getValue()) : "";
  const salesRep = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.SALES_REP).getValue()) : "";
  const pipelineBefore = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.PIPELINE).getValue()) : "Lead";
  const actId = appendActivity_({
    merchantId: data.merchantId, businessName: businessName, action: "Follow Up",
    contactMethod: "", contactPerson: "", pipelineBefore: pipelineBefore,
    pipelineAfter: "Follow Up", summary: "Reason: " + (data.reason || "") + " | Outcome: " + (data.outcome || ""), salesRep: salesRep
  });
  const fuSheet = getSheet_(SHEET_NAMES.FOLLOW_UPS);
  if (fuSheet && fuSheet.getLastRow() >= 2) {
    const fuData = fuSheet.getRange(2, 1, fuSheet.getLastRow() - 1, 9).getValues();
    fuData.forEach((row, idx) => {
      if (sanitizeValue_(row[COL.FOLLOW_UPS.MERCHANT_ID - 1]) === String(data.merchantId) && sanitizeValue_(row[COL.FOLLOW_UPS.STATUS - 1]) === "Pending") {
        fuSheet.getRange(idx + 2, COL.FOLLOW_UPS.STATUS).setValue("Completed");
      }
    });
  }
  updateMerchantPipeline_(data.merchantId, "Follow Up");
  if (data.createAnother) {
    fuSheet.appendRow([generateId_("FU"), data.merchantId, businessName, actId, salesRep, data.nextDate || "", "Pending", data.nextNotes || "", getTimestamp_()]);
    if (mchRow >= 2 && data.nextDate) {
      mchSheet.getRange(mchRow, COL.MERCHANTS.NEXT_FOLLOW_UP).setValue(data.nextDate);
    }
  }
  if (data.discussionPoints) {
    savePointsList_(data.merchantId, businessName, salesRep, data.discussionPoints);
  }
  return actId;
}

// ─── Log Meeting ──────────────────────────────────────────────────
function logMeetingFromPanel(data) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(data.merchantId);
  const businessName = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.BUSINESS_NAME).getValue()) : "";
  const salesRep = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.SALES_REP).getValue()) : "";
  const pipelineBefore = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.PIPELINE).getValue()) : "Lead";
  const mtgSheet = getSheet_(SHEET_NAMES.MEETINGS);
  const mtgId = generateId_("MTG");
  mtgSheet.appendRow([mtgId, data.merchantId, businessName, data.meetingDate || getDateStr_(), data.meetingTime || getTimeStr_(), data.meetingType || "In Person", data.contactPerson || "", salesRep, data.result || "", "", data.notes || "", getTimestamp_()]);
  const actId = appendActivity_({
    merchantId: data.merchantId, businessName: businessName, action: "Meeting",
    contactMethod: data.meetingType || "", contactPerson: data.contactPerson || "",
    pipelineBefore: pipelineBefore, pipelineAfter: "Meeting",
    summary: "Meeting ID: " + mtgId + " | Type: " + (data.meetingType || "In Person") + " | Result: " + (data.result || "") + " | Notes: " + (data.notes || ""),
    salesRep: salesRep
  });
  updateMerchantPipeline_(data.merchantId, "Meeting");
  if (data.createFollowUp) {
    const fuSheet = getSheet_(SHEET_NAMES.FOLLOW_UPS);
    fuSheet.appendRow([generateId_("FU"), data.merchantId, businessName, actId, salesRep, data.followUpDate || "", "Pending", data.followUpNotes || "", getTimestamp_()]);
    if (mchRow >= 2 && data.followUpDate) {
      mchSheet.getRange(mchRow, COL.MERCHANTS.NEXT_FOLLOW_UP).setValue(data.followUpDate);
    }
  }
  if (data.discussionPoints) {
    savePointsList_(data.merchantId, businessName, salesRep, data.discussionPoints);
  }
  if (data.sendEmail) triggerEmailAutomation_('Meeting', data.merchantId, data);
  return actId;
}

// ─── Legacy helpers ───────────────────────────────────────────────
function logActivityToSheet(rowIndex, type, notes) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  if (rowIndex >= 2 && rowIndex <= mchSheet.getLastRow()) {
    const mId = sanitizeValue_(mchSheet.getRange(rowIndex, COL.MERCHANTS.ID).getValue());
    logActivityFromPanel({ merchantId: mId, action: type, summary: notes });
  }
  return { status: "success" };
}

function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const DAY = 86400000;
  const fmt = d => Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  const read = (name, cols) => {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return [];
    return sh.getRange(2, 1, sh.getLastRow() - 1, cols).getValues();
  };
  const s = v => sanitizeValue_(v);
  const parseDate = v => {
    const str = s(v); if (!str) return null;
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d) ? null : d;
  };
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const STAGES = ['Lead','Contact','Follow Up','Meeting','Demo','Proposal','Negotiation','Contract','Onboarding','Live','Lost'];
  const mchRows = read(SHEET_NAMES.MERCHANTS, 26);
  const actRows = read(SHEET_NAMES.ACTIVITIES, 14);
  const mtgRows = read(SHEET_NAMES.MEETINGS, 12);
  const fbRows = read(SHEET_NAMES.FEEDBACK, 9);
  const fuRows = read(SHEET_NAMES.FOLLOW_UPS, 9);
  const lastTouch = {}, repAct = {}, repMtg = {};
  actRows.forEach(r => {
    const mid = s(r[1]), rep = s(r[11]);
    const dt = parseDate(r[3]) || parseDate(r[12]);
    if (rep) bump(repAct, rep);
    if (dt && (!lastTouch[mid] || dt > lastTouch[mid])) lastTouch[mid] = dt;
  });
  mtgRows.forEach(r => {
    const mid = s(r[1]), rep = s(r[7]);
    const dt = parseDate(r[3]) || parseDate(r[11]);
    if (rep) bump(repMtg, rep);
    if (dt && (!lastTouch[mid] || dt > lastTouch[mid])) lastTouch[mid] = dt;
  });
  fuRows.forEach(r => {
    const mid = s(r[1]);
    const dt = parseDate(r[5]) || parseDate(r[8]);
    if (dt && (!lastTouch[mid] || dt > lastTouch[mid])) lastTouch[mid] = dt;
  });
  const merchants = mchRows.map(r => {
    const id = s(r[0]);
    const created = parseDate(r[24]), updated = parseDate(r[25]);
    const lt = lastTouch[id] || updated || created || today;
    const idle = Math.max(0, Math.floor((today - lt) / DAY));
    return { id: id, name: s(r[1]), cat: s(r[2]), rep: s(r[14]), pipeline: s(r[17]) || 'Lead', created: created, updated: updated, idle: idle };
  });
  const total = merchants.length;
  const live = merchants.filter(m => m.pipeline === 'Live').length;
  const lost = merchants.filter(m => m.pipeline === 'Lost').length;
  const inPipeline = total - live - lost;
  const winRate = total ? live / total : 0;
  const pCount = {}; STAGES.forEach(st => pCount[st] = 0);
  merchants.forEach(m => { if (pCount[m.pipeline] !== undefined) pCount[m.pipeline]++; });
  const maxP = Math.max.apply(null, [1].concat(STAGES.map(st => pCount[st])));
  const pipeline = STAGES.map((st, i) => {
    const c = pCount[st];
    const prev = i > 0 ? pCount[STAGES[i - 1]] : c;
    const step = (i > 0 && prev > 0) ? Math.round((c / prev) * 100) : null;
    return { stage: st, count: c, pct: total ? Math.round((c / total) * 100) : 0, step: step, max: maxP };
  });
  const catMap = {};
  merchants.forEach(m => bump(catMap, m.cat || 'Uncategorised'));
  const categories = Object.keys(catMap).map(k => ({ name: k, count: catMap[k] }))
    .sort((a, b) => b.count - a.count)
    .map(c => ({ name: c.name, count: c.count, pct: total ? Math.round((c.count / total) * 1000) / 10 : 0 }));
  let pos = 0, neu = 0, neg = 0;
  fbRows.forEach(r => {
    const t = (s(r[5]) || '').toLowerCase();
    if (t === 'positive') pos++; else if (t === 'negative') neg++; else neu++;
  });
  const feedback = pos + neu + neg;
  const positivity = (pos + neg) ? pos / (pos + neg) : 0;
  const repLive = {};
  merchants.forEach(m => { if (m.pipeline === 'Live' && m.rep) bump(repLive, m.rep); });
  const repNames = Object.keys(repAct).concat(Object.keys(repMtg)).filter((v, i, a) => a.indexOf(v) === i);
  const reps = repNames.map(n => ({ name: n, activities: repAct[n] || 0, meetings: repMtg[n] || 0, won: repLive[n] || 0 }))
    .sort((a, b) => (b.activities + b.meetings) - (a.activities + a.meetings)).slice(0, 8);
  const overdue = [];
  fuRows.forEach(r => {
    if ((s(r[6]) || '').toLowerCase() !== 'pending') return;
    const due = parseDate(r[5]); if (!due) return;
    if (due < today) overdue.push({ merchant: s(r[2]) || s(r[1]), merchantId: s(r[1]), due: fmt(due), rep: s(r[4]), id: s(r[0]), late: Math.floor((today - due) / DAY) });
  });
  overdue.sort((a, b) => a.due < b.due ? -1 : 1);
  const pendingFU = fuRows.filter(r => (s(r[6]) || '').toLowerCase() === 'pending').length;
  const feed = [];
  actRows.forEach(r => feed.push({ merchantId: s(r[1]), title: s(r[5]) || 'Activity', kind: 'activity', time: s(r[3]) + ' ' + s(r[4]), rep: s(r[11]), at: parseDate(r[3]) || parseDate(r[12]) }));
  mtgRows.forEach(r => feed.push({ merchantId: s(r[1]), title: (s(r[5]) || 'Meeting') + ' · ' + (s(r[8]) || ''), kind: 'meeting', time: s(r[3]) + ' ' + s(r[4]), rep: s(r[7]), at: parseDate(r[3]) || parseDate(r[11]) }));
  fuRows.forEach(r => feed.push({ merchantId: s(r[1]), title: 'Follow Up · ' + (s(r[6]) || ''), kind: 'followup', time: s(r[5]), rep: s(r[4]), at: parseDate(r[5]) || parseDate(r[8]) }));
  feed.sort((a, b) => (b.at || 0) - (a.at || 0));
  const recent = feed.slice(0, 8).map(f => ({ merchantId: f.merchantId, title: f.title, kind: f.kind, time: f.time, rep: f.rep }));
  const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: mNames[d.getMonth()] });
  }
  const newByM = {}, convByM = {};
  months.forEach(m => { newByM[m.key] = 0; convByM[m.key] = 0; });
  merchants.forEach(m => { if (m.created) { const k = m.created.getFullYear() + '-' + String(m.created.getMonth() + 1).padStart(2, '0'); if (newByM[k] !== undefined) newByM[k]++; } });
  actRows.forEach(r => {
    if ((s(r[5]) || '').toLowerCase() === 'live') {
      const dd = parseDate(r[3]);
      if (dd) { const k = dd.getFullYear() + '-' + String(dd.getMonth() + 1).padStart(2, '0'); if (convByM[k] !== undefined) convByM[k]++; }
    }
  });
  const trend = months.map(m => ({ label: m.label, merchants: newByM[m.key] || 0, conversions: convByM[m.key] || 0 }));
  const idleByStage = {};
  merchants.forEach(m => {
    if (m.pipeline === 'Lost') return;
    if (!idleByStage[m.pipeline]) idleByStage[m.pipeline] = [];
    idleByStage[m.pipeline].push(m.idle);
  });
  const momentum = STAGES.filter(st => st !== 'Lost').map(st => {
    const arr = idleByStage[st];
    const avg = arr && arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    return { stage: st, days: avg };
  });
  const merchantsOut = merchants.map(m => ({ id: m.id, name: m.name, rep: m.rep, stage: m.pipeline, cat: m.cat, idle: m.idle }));
  return {
    generatedAt: fmt(new Date()),
    sheetUrl: ss.getUrl(),
    kpi: { merchants: total, inPipeline: inPipeline, live: live, lost: lost, winRate: winRate, pendingFU: pendingFU, overdue: overdue.length, activities: actRows.length, meetings: mtgRows.length, feedback: feedback, positivity: positivity, newThisMonth: trend[trend.length - 1].merchants },
    pipeline: pipeline, categories: categories,
    sentiment: { positive: pos, neutral: neu, negative: neg, positivity: positivity },
    reps: reps, overdue: overdue.slice(0, 30), recent: recent, trend: trend, momentum: momentum,
    merchants: merchantsOut
  };
}

function addFeedbackFromPanel(data) {
  const mchSheet = getSheet_(SHEET_NAMES.MERCHANTS);
  const mchRow = findMerchantRow_(data.merchantId);
  const businessName = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.BUSINESS_NAME).getValue()) : "";
  const salesRep = mchRow >= 2 ? sanitizeValue_(mchSheet.getRange(mchRow, COL.MERCHANTS.SALES_REP).getValue()) : "";
  savePointsList_(data.merchantId, businessName, salesRep, [{ sentiment: data.feedbackType || "Neutral", text: data.point || "" }]);
  bustMerchantCache_(data.merchantId);
}

/** Safe wrapper: email automation must NEVER break CRM saves. */
function triggerEmailAutomation_(eventName, merchantId, payload) {
  try {
    if (typeof EmailRouter !== 'undefined') EmailRouter.trigger(eventName, merchantId, payload);
  } catch (e) {
    console.error('Email automation skipped: ' + e.message);
  }
}

function debugEmailLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets().map(s => s.getName());
  let targetSheet = ss.getSheetByName('Email_Logs');
  let lastRow = targetSheet ? targetSheet.getLastRow() : 0;
  let logs = [];
  try { logs = NEXG_EMAIL_getLogs(5); } catch (e) { logs = 'ERROR: ' + e.message; }
  return {
    allSheetsInFile: allSheets,
    exactMatch_Found: allSheets.includes('Email_Logs'),
    targetSheetLastRow: lastRow,
    dataReturnedToUI: logs
  };
}