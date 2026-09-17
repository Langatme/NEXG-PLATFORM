/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 00_Project.gs
 *
 * Purpose:
 * - Global NEXG namespace
 * - API gateway
 * - Result envelope
 * - Error handling
 * - Event bus
 * - Route dispatcher (single authoritative router)
 */

function NEXG_readSavedSource() {
  // Apps Script API via ScriptApp isn't available for file source directly,
  // so instead we inspect the live function and search the editor file by name.
  var src = NEXG.routeRequest.toString();
  console.log('Live router has PANEL_ROUTES: ' + (src.indexOf('PANEL_ROUTES') !== -1));
  console.log('Live router has candidates:   ' + (src.indexOf('candidates') !== -1));
  console.log('Live router length:           ' + src.length);
}
function NEXG_whichProject() { console.log('I AM PROJECT: ' + SpreadsheetApp.getActiveSpreadsheet().getName()); }
var NEXG = NEXG || {};

NEXG.version = '1.0.0';
NEXG.appName = 'NEXG CRM';
NEXG.suppressAuditDepth = 0;

NEXG.Repositories = NEXG.Repositories || {};
NEXG.RepositoryCache = NEXG.RepositoryCache || {};

/* ---------------- Error type ---------------- */

function NexgApiError(code, message, details) {
  this.name = 'NexgApiError';
  this.code = code;
  this.message = message;
  this.details = details || {};
}
NexgApiError.prototype = Object.create(Error.prototype);
NexgApiError.prototype.constructor = NexgApiError;
NEXG.ApiError = NexgApiError;

NEXG.throwError = function(code, message, details) {
  throw new NEXG.ApiError(code, message, details);
};

/* ---------------- Envelopes ---------------- */

NEXG.ok = function(data, meta, warnings) {
  return { success: true, data: data || {}, meta: meta || {}, warnings: warnings || [] };
};

NEXG.fail = function(code, message, details) {
  return { success: false, error: { code: code, message: message, details: details || {} } };
};

/* ---------------- Event bus ---------------- */

NEXG.EventBus = {
  handlers: {},
  subscribe: function(event, handler) {
    if (!event || typeof handler !== 'function') return;
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  },
  publish: function(event, payload) {
    if (!event) return;
    var handlers = this.handlers[event] || [];
    handlers.forEach(function(handler) {
      try { handler(payload || {}); }
      catch (err) { console.error('NEXG event handler failed.', event, err); }
    });
  }
};

/* ---------------- Audit suppression ---------------- */

NEXG.suppressAudit = function(fn) {
  NEXG.suppressAuditDepth++;
  try { return fn(); }
  finally { NEXG.suppressAuditDepth--; }
};

NEXG.isAuditSuppressed = function() {
  return NEXG.suppressAuditDepth > 0;
};

/* ---------------- Repository access ---------------- */

NEXG.getRepository = function(repoKey) {
  var factory = NEXG.Repositories[repoKey];
  if (!factory) NEXG.throwError('REPOSITORY_NOT_FOUND', 'Repository not found: ' + repoKey);
  return factory();
};

/* ---------------- Request normalization ---------------- */

NEXG.normalizeRequest = function(request) {
  request = request || {};
  if (typeof request === 'string') request = { route: request, payload: {} };
  return { route: String(request.route || ''), payload: request.payload || {} };
};

NEXG.registerAutomations = function() {
  if (NEXG.automationsRegistered) return;
  if (NEXG.Automations && typeof NEXG.Automations.register === 'function') NEXG.Automations.register();
  NEXG.automationsRegistered = true;
};

/* ================================================================
   SINGLE AUTHORITATIVE ROUTER
   ----------------------------------------------------------------
   Dispatch order:
     1. panel.*     → NEXG.SmartPanel[method]
     2. workflow.*  → NEXG.Workflows[method]
     3. system.*    → built-in (health / init / bootstrap)
     4. entity.*    → repository CRUD (host.create, settings.upsert…)

   The panel/workflow lookup re-reads the live global object on every
   call and, if it misses, logs the keys it actually saw — so any
   future failure self-diagnoses.
   ================================================================ */

NEXG.routeRequest = function(route, payload) {
  payload = payload || {};

  if (typeof route !== 'string') {
    NEXG.throwError('ROUTE_INVALID', 'Route must be a string.');
  }

  var dot = route.indexOf('.');
  var ns = dot !== -1 ? route.slice(0, dot) : route;
  var method = dot !== -1 ? route.slice(dot + 1) : '';

  /* ---- 1 & 2. panel.* and workflow.* via explicit live lookup ---- */
    /* ---- 1 & 2. panel.* and workflow.* via explicit route map ---- */
  var PANEL_ROUTES = {
    bootstrap: 'getBootstrap',
    workspace: 'getWorkspace',
    search: 'search',
    operations: 'getOperations',
    insights: 'getInsights',
    onboarding: 'getOnboarding',
    pinned: 'getPinned'
  };

  if (ns === 'panel' || ns === 'workflow') {
    var target = (ns === 'panel') ? NEXG.SmartPanel : NEXG.Workflows;
    var resolvedName = (ns === 'panel' && PANEL_ROUTES[method]) ? PANEL_ROUTES[method] : method;
    var fn = target ? target[resolvedName] : null;

    if (typeof fn === 'function') {
      try { return fn(payload); }
      catch (err) {
        if (err.name === 'NexgApiError') return NEXG.fail(err.code, err.message, err.details);
        return NEXG.fail('ROUTE_FAILED', err.message || 'Unknown error.');
      }
    }

    console.error('ROUTE MISS [' + route + '] resolved=' + resolvedName +
      ' keys=' + (target ? Object.keys(target).join(',') : 'null'));
    return NEXG.fail('ROUTE_NOT_FOUND', 'Unknown route: ' + route);
  }

  /* ---- 3. system.* ---- */
  if (ns === 'system') {
    if (method === 'health') {
      return NEXG.ok({ app: NEXG.appName, version: NEXG.version, status: 'ok', time: new Date().toISOString() });
    }
    if (method === 'init') {
      if (!NEXG.Security.hasAnyPermission()) return NEXG.Initializer.run(payload);
      NEXG.Security.requirePermission('settings.edit');
      return NEXG.Initializer.run(payload);
    }
    if (method === 'bootstrap') {
      if (NEXG.Security.hasAnyPermission()) NEXG.Security.requirePermission('panel.use');
      return NEXG.ok(NEXG.Security.getBootstrapPayload());
    }
    NEXG.throwError('ROUTE_NOT_FOUND', 'Unknown system route: ' + route);
  }

  /* ---- 4. entity CRUD ---- */
  if (dot === -1) NEXG.throwError('ROUTE_INVALID', 'Invalid route: ' + route);

  var entity = ns;
  var action = method;

  if (entity === 'settings' && action === 'upsert') {
    NEXG.Security.requirePermission('settings.edit');
    return NEXG.Migrations.upsertSetting(payload.category, payload.key, payload.value || {}, payload.options || {});
  }

  var repoKey = NEXG.Const.API_ENTITY_TO_REPO[entity];
  if (!repoKey) NEXG.throwError('ENTITY_NOT_FOUND', 'Unknown API entity: ' + entity);

  var permissionAction = NEXG.Const.ACTION_PERMISSION[action] || action;
  NEXG.Security.requirePermission(entity + '.' + permissionAction);

  var repo = NEXG.getRepository(repoKey);

  if (action === 'create') return repo.create(payload);
  if (action === 'update') {
    var id = payload.id;
    var data = payload.data || payload;
    if (!id && payload[repo.idField]) id = payload[repo.idField];
    return repo.update(id, data);
  }
  if (action === 'get') return repo.findById(payload.id || payload[repo.idField]);
  if (action === 'search') {
    var query = typeof payload === 'string' ? payload : payload.query || '';
    return repo.search(query, payload.options || {});
  }
  if (action === 'findByField') return repo.findByField(payload.field, payload.value);
  if (action === 'findByCategoryKey') {
    if (!repo.findByCategoryKey) NEXG.throwError('ACTION_NOT_SUPPORTED', 'findByCategoryKey only supported by Settings.');
    return repo.findByCategoryKey(payload.category, payload.key);
  }
  if (action === 'archive') return repo.archive(payload.id || payload[repo.idField]);

  NEXG.throwError('ACTION_NOT_FOUND', 'Unknown action: ' + action);
};

/* ---------------- Public entrypoints ---------------- */

NEXG.handleApiRequest = function(request) {
  try {
    request = NEXG.normalizeRequest(request);
    NEXG.registerAutomations();
    return NEXG.routeRequest(request.route, request.payload);
  } catch (err) {
    if (err.name === 'NexgApiError') return NEXG.fail(err.code, err.message, err.details);
    console.error('NEXG internal error.', err);
    return NEXG.fail('INTERNAL_ERROR', err.message || 'Unknown error.');
  }
};

function NEXG_api(request) {
  return NEXG.handleApiRequest(request);
}

function NEXG_health() {
  return NEXG.handleApiRequest({ route: 'system.health' });
}
function NEXG_verifyRouter() {
  console.log(JSON.stringify(NEXG_api({ route: 'panel.bootstrap', payload: {} })).slice(0, 150));
  console.log(JSON.stringify(NEXG_api({ route: 'panel.operations', payload: {} })).slice(0, 150));
  console.log(JSON.stringify(NEXG_api({ route: 'panel.insights', payload: {} })).slice(0, 150));
}