/**
 * SYSTEM HEARTBEAT — PROOF OF ARCHITECTURE
 * Run this from the Apps Script Editor to prove every layer is connected.
 */
function runFullSystemProof() {
  const log = [];
  const start = new Date();
  
  try {
    // 1. PROVE SHEET DATA LAYER (SheetData.gs)
    log.push("🟢 [1/6] Checking SheetData Layer...");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Email_Logs");
    if (!sheet) throw new Error("Email_Logs sheet missing");
    const rowCount = sheet.getLastRow();
    log.push(`   ✅ Sheet found: 'Email_Logs' (${rowCount} rows)`);

    // 2. PROVE CONFIG LAYER (EmailConfig.gs / SheetData helpers)
    log.push("🟢 [2/6] Checking Config Layer...");
    // We use the helper from SheetData.gs to read settings
    const adminEmail = NEXG_EMAIL_getSetting('ADMIN_EMAIL'); 
    if (!adminEmail) throw new Error("ADMIN_EMAIL setting missing");
    log.push(`   ✅ Config read: ADMIN_EMAIL = ${adminEmail}`);

    // 3. PROVE TEMPLATE LAYER (EmailTemplates.gs)
    log.push("🟢 [3/6] Checking Template Layer...");
    const templates = EmailTemplates.list();
    if (!templates || templates.length === 0) throw new Error("No templates found");
    log.push(`   ✅ Templates loaded: ${templates.length} found (e.g., ${templates[0]})`);

    // 4. PROVE RENDERER LAYER (EmailRenderer.gs)
    log.push("🟢 [4/6] Checking Renderer Layer...");
    const mockData = {
      contact_person: "System Test",
      business_name: "NEXG Architecture",
      meeting_date: "Today",
      meeting_time: "Now",
      sales_rep: "Bot"
    };
    // Force a render of the first template
    const html = EmailRenderer.render(templates[0], mockData, {});
    if (!html || html.length < 100) throw new Error("Renderer produced empty HTML");
    log.push(`   ✅ Renderer working: Generated ${html.length} chars of HTML`);

    // 5. PROVE LOGGER LAYER (EmailLogger.gs -> SheetData.gs)
    log.push("🟢 [5/6] Checking Logger Layer...");
    const testLogId = "PROOF-" + new Date().getTime();
    NEXG_EMAIL_appendLog({
      logId: testLogId,
      status: "SYSTEM_PROOF",
      template: "HEARTBEAT",
      recipient: adminEmail,
      subject: "Architecture Proof",
      payload: { step: 5, msg: "Logger write successful" }
    });
    // Verify it was written by reading it back immediately
    const recentLogs = NEXG_EMAIL_getLogs(1);
    if (!recentLogs || recentLogs[0].logId !== testLogId) throw new Error("Logger write failed or read mismatch");
    log.push(`   ✅ Logger working: Wrote and verified ID ${testLogId}`);

    // 6. PROVE CLIENT BRIDGE (Simulated)
    // We can't run browser JS here, but we can prove the server functions 
    // that the client calls (ccBootstrap, ccLogs) are accessible and return data.
    log.push("🟢 [6/6] Checking Client Bridge (Server Side)...");
    
    // Simulate ccBootstrap()
    const bootstrapData = Email.bootstrap(); 
    if (!bootstrapData.ok) throw new Error("Email.bootstrap() failed");
    log.push(`   ✅ Bridge (Bootstrap): OK. Stats: ${bootstrapData.stats.sent} sent, ${bootstrapData.stats.failed} failed.`);
    
    // Simulate ccLogs()
    const logsData = Email.logs(5, 'ALL');
    if (!Array.isArray(logsData)) throw new Error("Email.logs() did not return array");
    log.push(`   ✅ Bridge (Logs): OK. Returned ${logsData.length} recent logs.`);

    log.push("🏁 SYSTEM PROOF COMPLETE. All layers connected.");

  } catch (e) {
    log.push(`❌ CRITICAL FAILURE: ${e.message}`);
    log.push(`   Stack: ${e.stack}`);
  }

  // Output to Logger
  log.forEach(line => Logger.log(line));
  
  // Output to Toast
  SpreadsheetApp.getActiveSpreadsheet().toast(log[log.length-1], "System Proof", 10);
  
  return log.join("\n");
}