/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 40_Security.gs
 *
 * Purpose:
 * - Current user resolution
 * - Permission enforcement
 * - Bootstrap admin initialization
 */

var NEXG = NEXG || {};

NEXG.Security = {

  _systemDepth: 0,

  isSystemMode: function() {
    return NEXG.Security._systemDepth > 0;
  },

  runAsSystem: function(fn) {
    NEXG.Security._systemDepth++;

    try {
      return fn();
    } finally {
      NEXG.Security._systemDepth--;
    }
  },

  getCurrentUserEmail: function() {
    var email = '';

    try {
      email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    } catch (err) {
      email = '';
    }

    if (!email) {
      email = 'system';
    }

    return String(email).toLowerCase();
  },

  hasAnyPermission: function() {
    try {
      var records = NEXG.Migrations.findSettingsByCategory('permission');

      return records.some(function(record) {
        return NEXG.Utilities.isActive(record.active);
      });
    } catch (err) {
      return false;
    }
  },

  getPermissionRecord: function(email) {
    var records = NEXG.Migrations.findSettingsByCategory('permission');

    for (var i = 0; i < records.length; i++) {
      if (String(records[i].key).toLowerCase() === String(email).toLowerCase()) {
        var value = records[i].valueJson;

        if (typeof value !== 'object') {
          value = {};
        }

        return {
          email: records[i].key,
          role: value.role || NEXG.Const.ROLES.VIEWER,
          active: NEXG.Utilities.isActive(records[i].active)
        };
      }
    }

    return null;
  },

  requirePermission: function(permission) {
    if (NEXG.Security.isSystemMode()) {
      return;
    }

    var email = NEXG.Security.getCurrentUserEmail();

    if (email === 'system') {
      return;
    }

    if (!NEXG.Security.hasAnyPermission() && NEXG.Config.allowBootstrapMode) {
      return;
    }

    var record = NEXG.Security.getPermissionRecord(email);

    if (!record || !record.active) {
      NEXG.throwError('PERMISSION_DENIED', 'You do not have access to perform this action.');
    }

    if (record.role === NEXG.Const.ROLES.ADMIN) {
      return;
    }

    var permissions = NEXG.Const.ROLE_PERMISSIONS[record.role] || [];

    if (permissions.indexOf('*') !== -1 || permissions.indexOf(permission) !== -1) {
      return;
    }

    NEXG.throwError('PERMISSION_DENIED', 'Missing permission: ' + permission);
  },

  ensureBootstrapAdmin: function() {
    if (NEXG.Security.hasAnyPermission()) {
      return NEXG.ok({ created: false });
    }

    var props = PropertiesService.getScriptProperties();
    var adminEmail = props.getProperty(NEXG.Config.scriptPropertyKeys.adminEmail);

    if (!adminEmail) {
      adminEmail = NEXG.Security.getCurrentUserEmail();
    }

    if (!adminEmail) {
      adminEmail = 'system';
    }

    return NEXG.Security.runAsSystem(function() {
      var result = NEXG.Migrations.upsertSetting(
        'permission',
        String(adminEmail).toLowerCase(),
        { role: NEXG.Const.ROLES.ADMIN },
        { silent: true }
      );

      return NEXG.ok({
        created: true,
        adminEmail: String(adminEmail).toLowerCase(),
        setting: result.data ? result.data.record : null
      });
    });
  },

  validRoles: function() {
    return [NEXG.Const.ROLES.ADMIN, NEXG.Const.ROLES.MANAGER, NEXG.Const.ROLES.AGENT, NEXG.Const.ROLES.VIEWER];
  },

  /**
   * OWNER: grants a role to a teammate (creates or updates their
   * permission record). Email Center access follows the role:
   * Viewer sees it, Manager/Agent can also send, Admin has full access.
   */
  grantRole: function(email, role) {
    NEXG.Security.requirePermission('settings.edit');
    email = String(email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) {
      NEXG.throwError('VALIDATION_ERROR', 'Valid email is required.');
    }
    if (NEXG.Security.validRoles().indexOf(role) === -1) {
      NEXG.throwError('VALIDATION_ERROR', 'Role must be one of: ' + NEXG.Security.validRoles().join(', '));
    }
    NEXG.Migrations.upsertSetting('permission', email, { role: role });
    return NEXG.ok({ email: email, role: role });
  },

  revokeAccess: function(email) {
    NEXG.Security.requirePermission('settings.edit');
    email = String(email || '').trim().toLowerCase();
    if (!email) NEXG.throwError('VALIDATION_ERROR', 'Email is required.');
    var rec = NEXG.Migrations.findSettingRecord('permission', email);
    if (rec) NEXG.getRepository('Settings').archive(rec.settingId);
    return NEXG.ok({ email: email, revoked: !!rec });
  },

  listTeam: function() {
    NEXG.Security.requirePermission('settings.edit');
    var records = NEXG.Migrations.findSettingsByCategory('permission');
    return NEXG.ok({
      team: records.map(function(r) {
        var v = r.valueJson && typeof r.valueJson === 'object' ? r.valueJson : {};
        return { email: r.key, role: v.role || NEXG.Const.ROLES.VIEWER, active: r.active };
      })
    });
  },

  getBootstrapPayload: function() {
    var email = NEXG.Security.getCurrentUserEmail();
    var initialized = NEXG.Security.hasAnyPermission();
    var permission = initialized ? NEXG.Security.getPermissionRecord(email) : null;

    return {
      app: NEXG.appName,
      version: NEXG.version,
      user: email,
      initialized: initialized,
      role: permission ? permission.role : 'Bootstrap',
      permissions: permission ? (NEXG.Const.ROLE_PERMISSIONS[permission.role] || []) : ['*']
    };
  }
};

/**
 * OWNER HELPERS — run these from the Apps Script editor as the owner.
 * After adding, teammates re-open the Sheet (or hard-refresh) and use
 * NEXG CRM → Email Center, or the dashboard. Roles: Admin, Manager,
 * Agent, Viewer (Viewer sees the Email Center but cannot send).
 */
function NEXG_addTeamMember(email, role) {
  var res = NEXG.Security.grantRole(email, role || NEXG.Const.ROLES.AGENT);
  console.log('Team member added: ' + res.data.email + ' as ' + res.data.role);
  return res;
}

function NEXG_listTeam() {
  var res = NEXG.Security.listTeam();
  console.log(JSON.stringify(res.data.team, null, 2));
  return res;
}

function NEXG_removeTeamMember(email) {
  var res = NEXG.Security.revokeAccess(email);
  console.log('Access revoked: ' + res.data.email);
  return res;
}