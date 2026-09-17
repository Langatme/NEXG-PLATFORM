/**
 * NEXG CRM
 * Contract 1 — Foundation
 * File: 02_Constants.gs
 *
 * Purpose:
 * - Enums
 * - Core schemas
 * - Roles and permissions
 * - Default pipeline stages
 * - Default activity types
 */

var NEXG = NEXG || {};

NEXG.Const = {

  ROLES: {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    AGENT: 'Agent',
    VIEWER: 'Viewer'
  },

  LIFECYCLE_STATUSES: [
    'Active',
    'Stale',
    'Re-engaged',
    'Lost',
    'Archived'
  ],

  MEETING_STATUSES: [
    'Scheduled',
    'Confirmed',
    'Rescheduled',
    'Completed',
    'Cancelled',
    'Missed'
  ],

  EMAIL_STATUSES: [
    'Draft',
    'Queued',
    'Sending',
    'Sent',
    'Delivered',
    'Opened',
    'Clicked',
    'Replied',
    'Failed',
    'Archived'
  ],

  SYSTEM_WRITE_PROTECTED_FIELDS: [
    'hostId',
    'activityId',
    'meetingId',
    'emailLogId',
    'settingId',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'archivedAt',
    'archivedBy'
  ],

  ACTION_PERMISSION: {
    create: 'create',
    update: 'edit',
    get: 'view',
    search: 'view',
    findByField: 'view',
    findByCategoryKey: 'view',
    archive: 'archive',
    upsert: 'edit'
  },

  API_ENTITY_TO_REPO: {
    host: 'Hosts',
    activity: 'Activities',
    meeting: 'Meetings',
    email: 'EmailLogs',
    emailLog: 'EmailLogs',
    settings: 'Settings'
  },

  REPO_META: {
    Hosts: {
      sheetName: 'Hosts',
      idField: 'hostId'
    },
    Activities: {
      sheetName: 'Activities',
      idField: 'activityId'
    },
    Meetings: {
      sheetName: 'Meetings',
      idField: 'meetingId'
    },
    EmailLogs: {
      sheetName: 'EmailLogs',
      idField: 'emailLogId'
    },
    Settings: {
      sheetName: 'Settings',
      idField: 'settingId'
    }
  },

  ROLE_PERMISSIONS: {
    Admin: ['*'],

    Manager: [
      'panel.use',
      'dashboard.view',
      'host.view',
      'host.create',
      'host.edit',
      'host.archive',
      'activity.view',
      'activity.create',
      'activity.edit',
      'meeting.view',
      'meeting.schedule',
      'meeting.edit',
      'meeting.archive',
      'email.view',
      'email.send',
      'email.edit',
      'settings.view'
    ],

    Agent: [
      'panel.use',
      'dashboard.view',
      'host.view',
      'host.create',
      'host.edit',
      'activity.view',
      'activity.create',
      'meeting.view',
      'meeting.schedule',
      'email.view',
      'email.send'
    ],

    Viewer: [
      'panel.use',
      'dashboard.view',
      'host.view',
      'activity.view',
      'meeting.view',
      'email.view',
      'settings.view'
    ]
  },
  DEFAULT_STAGES: [
    { key: 'lead', label: 'Lead' },
    { key: 'discovery', label: 'Discovery' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'contract', label: 'Contract' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'live', label: 'Live' }
  ],

  /**
   * Single source of truth for onboarding option lists.
   * Served to the panel via bootstrap (hostOptions) so modal selects
   * and server validation can never drift apart.
   */
  HOST_OPTIONS: {
    hostTypes: ['Individual', 'Company', 'Property Manager', 'Hotel Group', 'Other'],
    ownerships: ['Own', 'Manage', 'Both'],
    propertyTypes: [
      'Hotel', 'Apartment', 'Serviced Apartment', 'Villa', 'Guesthouse',
      'Hostel', 'Resort', 'Lodge', 'Student Accommodation',
      'Office / Mixed-use', 'Other'
    ]
  },

  DEFAULT_ACTIVITY_TYPES: [
    { key: 'system.initialized', label: 'System Initialized' },
    { key: 'host.created', label: 'Host Created' },
    { key: 'host.updated', label: 'Host Updated' },
    { key: 'host.archived', label: 'Host Archived' },
    { key: 'host.stageChanged', label: 'Host Stage Changed' },
    { key: 'call.logged', label: 'Call Logged' },
    { key: 'meeting.scheduled', label: 'Meeting Scheduled' },
    { key: 'meeting.completed', label: 'Meeting Completed' },
    { key: 'email.sent', label: 'Email Sent' },
    { key: 'followup.created', label: 'Follow-up Created' },
    { key: 'followup.completed', label: 'Follow-up Completed' },
    { key: 'proposal.sent', label: 'Proposal Sent' },
    { key: 'contract.signed', label: 'Contract Signed' },
    { key: 'photography.completed', label: 'Photography Completed' },
    { key: 'inspection.completed', label: 'Inspection Completed' },
    { key: 'goLive.completed', label: 'Go Live Completed' }
  ],

  CORE_SCHEMAS: {

    host: [
      { key: 'hostId', label: 'Host ID', type: 'id' },
      { key: 'hostName', label: 'Host Name', type: 'text', required: true },
      { key: 'contactType', label: 'Contact Type', type: 'text' },
      { key: 'leadSource', label: 'Lead Source', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'stage', label: 'Stage', type: 'dropdown', defaultValue: 'lead' },
      { key: 'lifecycleStatus', label: 'Lifecycle Status', type: 'dropdown', defaultValue: 'Active' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      // Onboarding skeleton (§1 host/org + §2 property). All optional:
      // fast lead capture (hostName only) keeps working unchanged.
      { key: 'hostType', label: 'Host Type', type: 'dropdown', options: 'hostTypes' },
      { key: 'legalName', label: 'Legal / Business Name', type: 'text' },
      { key: 'displayName', label: 'Display Name', type: 'text' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'website', label: 'Website / Socials', type: 'text' },
      { key: 'ownership', label: 'Own / Manage', type: 'dropdown', options: 'ownerships' },
      { key: 'propertiesManaged', label: 'Properties Managed', type: 'number' },
      { key: 'propertyName', label: 'Property Name', type: 'text' },
      { key: 'propertyType', label: 'Property Type', type: 'dropdown', options: 'propertyTypes' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'text' },
      { key: 'unitCount', label: 'Rooms / Units', type: 'number' },
      { key: 'checkIn', label: 'Check-in', type: 'text' },
      { key: 'checkOut', label: 'Check-out', type: 'text' },
      { key: 'reception', label: 'Reception Availability', type: 'text' },
      { key: 'lastContactAt', label: 'Last Contact At', type: 'datetime' },
      { key: 'nextFollowUpAt', label: 'Next Follow-up At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' },
      { key: 'archivedAt', label: 'Archived At', type: 'datetime' },
      { key: 'archivedBy', label: 'Archived By', type: 'text' }
    ],

    activity: [
      { key: 'activityId', label: 'Activity ID', type: 'id' },
      { key: 'hostId', label: 'Host ID', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'text', required: true },
      { key: 'subtype', label: 'Subtype', type: 'text' },
      { key: 'status', label: 'Status', type: 'dropdown', defaultValue: 'Completed' },
      { key: 'outcome', label: 'Outcome', type: 'text' },
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'dueAt', label: 'Due At', type: 'datetime' },
      { key: 'completedAt', label: 'Completed At', type: 'datetime' },
      { key: 'metadataJson', label: 'Metadata JSON', type: 'json' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' },
      { key: 'archivedAt', label: 'Archived At', type: 'datetime' },
      { key: 'archivedBy', label: 'Archived By', type: 'text' }
    ],

    meeting: [
      { key: 'meetingId', label: 'Meeting ID', type: 'id' },
      { key: 'hostId', label: 'Host ID', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime', required: true },
      { key: 'durationMinutes', label: 'Duration Minutes', type: 'number', defaultValue: 30 },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'mode', label: 'Mode', type: 'text' },
      { key: 'status', label: 'Status', type: 'dropdown', defaultValue: 'Scheduled' },
      { key: 'outcome', label: 'Outcome', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' },
      { key: 'archivedAt', label: 'Archived At', type: 'datetime' },
      { key: 'archivedBy', label: 'Archived By', type: 'text' }
    ],

    email: [
      { key: 'emailLogId', label: 'Email Log ID', type: 'id' },
      { key: 'hostId', label: 'Host ID', type: 'text', required: true },
      { key: 'templateId', label: 'Template ID', type: 'text' },
      { key: 'recipient', label: 'Recipient', type: 'text', required: true },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'bodyPreview', label: 'Body Preview', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'dropdown', defaultValue: 'Draft' },
      { key: 'queuedAt', label: 'Queued At', type: 'datetime' },
      { key: 'sentAt', label: 'Sent At', type: 'datetime' },
      { key: 'deliveredAt', label: 'Delivered At', type: 'datetime' },
      { key: 'openedAt', label: 'Opened At', type: 'datetime' },
      { key: 'clickedAt', label: 'Clicked At', type: 'datetime' },
      { key: 'repliedAt', label: 'Replied At', type: 'datetime' },
      { key: 'failedAt', label: 'Failed At', type: 'datetime' },
      { key: 'failureReason', label: 'Failure Reason', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' },
      { key: 'archivedAt', label: 'Archived At', type: 'datetime' },
      { key: 'archivedBy', label: 'Archived By', type: 'text' }
    ],

    settings: [
      { key: 'settingId', label: 'Setting ID', type: 'id' },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'key', label: 'Key', type: 'text', required: true },
      { key: 'valueJson', label: 'Value JSON', type: 'json', required: true },
      { key: 'active', label: 'Active', type: 'checkbox', defaultValue: true },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' },
      { key: 'archivedAt', label: 'Archived At', type: 'datetime' },
      { key: 'archivedBy', label: 'Archived By', type: 'text' }
    ]
  }
};