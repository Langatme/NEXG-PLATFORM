/**
 * NEXG CRM
 * Debug utilities
 */

/**
 * Runs initialization and prints the database location/state.
 */
function NEXG_repairAndInspect() {
  var initResult = NEXG_initialize();
  console.log('NEXG_initialize result:');
  console.log(JSON.stringify(initResult, null, 2));

  try {
    var ss = NEXG.Sheets.getSpreadsheet();
    console.log('\nDatabase spreadsheet URL:\n' + ss.getUrl());
    console.log('\nSheet tabs found:\n' + ss.getSheets().map(function(s) { return s.getName(); }).join(', '));
    console.log('');

    Object.keys(NEXG.Config.sheetNames).forEach(function(key) {
      var sheetName = NEXG.Config.sheetNames[key];
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) { console.log(sheetName + ': MISSING'); return; }
      console.log(sheetName + ': rows=' + sheet.getLastRow() + ', columns=' + sheet.getLastColumn());
    });
  } catch (err) {
    console.error('Inspection failed: ' + err.message);
  }
}

/**
 * Creates one test host.
 */
function NEXG_createSampleHost() {
  var result = NEXG_api({
    route: 'host.create',
    payload: {
      hostName: 'Sample Host',
      contactType: 'Test Contact',
      leadSource: 'Manual Test',
      phone: '+15550000000',
      email: 'sample@example.com',
      notes: 'This is a Contract 1 test record.'
    }
  });
  console.log('Sample host creation result:');
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Instantly applies the Black/Gold/White premium formatting to all existing NEXG sheets.
 */
function NEXG_formatDatabase() {
  var ss = NEXG.Sheets.getSpreadsheet();
  var sheetNames = Object.values(NEXG.Config.sheetNames);
  
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      NEXG.Sheets.formatSheet(sheet);
      console.log('Formatted: ' + name);
    }
  });
  
  console.log('Database formatting complete. Refresh your Google Sheet to see the new look.');
}

function NEXG_whichRouter() {
  var src = NEXG.routeRequest.toString();
  console.log('Has prefix-fallback (candidates): ' + (src.indexOf('candidates') !== -1));
  console.log('Length: ' + src.length);
}

function NEXG_checkRoutes() {
  console.log('getBootstrap:   ' + typeof NEXG.SmartPanel.getBootstrap);
  console.log('getWorkspace:   ' + typeof NEXG.SmartPanel.getWorkspace);
  console.log('getOperations:  ' + typeof NEXG.SmartPanel.getOperations);
  console.log('getInsights:    ' + typeof NEXG.SmartPanel.getInsights);
  console.log('logCall:        ' + typeof NEXG.Workflows.logCall);

  console.log(JSON.stringify(NEXG_api({ route: 'panel.bootstrap', payload: {} }), null, 2));
  console.log(JSON.stringify(NEXG_api({ route: 'panel.operations', payload: {} }), null, 2));
  console.log(JSON.stringify(NEXG_api({ route: 'panel.insights', payload: {} }), null, 2));
}

function NEXG_diagnose() {
  console.log('--- SmartPanel identity ---');
  console.log('typeof NEXG.SmartPanel:            ' + typeof NEXG.SmartPanel);
  console.log('getBootstrap on it:                ' + typeof (NEXG.SmartPanel && NEXG.SmartPanel.getBootstrap));
  console.log('getOperations on it:               ' + typeof (NEXG.SmartPanel && NEXG.SmartPanel.getOperations));

  console.log('--- Live router source ---');
  console.log(NEXG.routeRequest.toString().slice(0, 400));

  console.log('--- Direct calls (bypass router) ---');
  try { console.log('direct getBootstrap:  ' + JSON.stringify(NEXG.SmartPanel.getBootstrap({})).slice(0, 120)); }
  catch (e) { console.log('direct getBootstrap threw: ' + e.message); }
  try { console.log('direct getOperations: ' + JSON.stringify(NEXG.SmartPanel.getOperations({})).slice(0, 120)); }
  catch (e) { console.log('direct getOperations threw: ' + e.message); }

  console.log('--- Router call ---');
  console.log(JSON.stringify(NEXG.routeRequest('panel.bootstrap', {})).slice(0, 200));
}

function NEXG_checkBootstrap() {
  var res = NEXG_api({ route: 'panel.bootstrap', payload: {} });
  console.log(JSON.stringify(res.data.recentHosts, null, 2));
}