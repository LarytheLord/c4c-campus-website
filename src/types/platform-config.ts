/**
 * Platform Configuration Type Definitions
 * Complete white-labeling system types
 */

// ============================================================================
// PLATFORM BRANDING
// ============================================================================

export interface PlatformBranding {
  id: number;

  // Logo & Favicon
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;

  // Brand Identity
  brand_name: string;
  tagline?: string;

  // Color System
  primary_color: string;
  secondary_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  error_color: string;
  success_color: string;
  warning_color: string;

  // Typography
  font_family_heading: string;
  font_family_body: string;
  font_family_mono: string;

  // Additional Styling
  border_radius: string;
  button_style: 'rounded' | 'square' | 'pill';

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export interface PlatformSettings {
  id: number;

  // General Platform Info
  platform_name: string;
  platform_url: string;
  support_email: string;
  contact_email: string;

  // SEO Settings
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  seo_image_url?: string;

  // Social Media Links
  social_twitter?: string;
  social_github?: string;
  social_linkedin?: string;
  social_discord?: string;
  social_youtube?: string;
  social_facebook?: string;

  // Contact Information
  phone_number?: string;
  physical_address?: string;
  timezone: string;

  // Legal & Compliance
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  cookie_policy_url?: string;

  // Analytics & Tracking
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  hotjar_site_id?: string;

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export interface FeatureFlag {
  id: number;

  // Feature Identification
  feature_key: string;
  feature_name: string;
  description?: string;
  category: 'general' | 'courses' | 'applications' | 'discussions' | 'cohorts' | 'admin' | 'integrations' | 'experimental';

  // Feature State
  is_enabled: boolean;

  // Access Control
  enabled_for_roles: string[];
  enabled_for_users?: string[];

  // Rollout Control
  rollout_percentage: number;

  // Dependencies
  depends_on_features?: string[];

  // Metadata
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export interface EmailTemplateVariable {
  name: string;
  description: string;
  example?: string;
}

export interface EmailTemplate {
  id: number;

  // Template Identification
  template_key: string;
  template_name: string;
  description?: string;
  category: 'general' | 'authentication' | 'applications' | 'courses' | 'notifications' | 'system';

  // Email Content
  subject: string;
  body_html: string;
  body_text?: string;

  // Template Variables
  available_variables: EmailTemplateVariable[];

  // Email Settings
  from_name: string;
  from_email: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];

  // Design Settings
  header_color: string;
  footer_text: string;
  button_color: string;

  // Status
  is_active: boolean;
  is_default: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  updated_by?: string;
  last_sent_at?: string;
  send_count: number;
}

// ============================================================================
// ADVANCED SETTINGS
// ============================================================================

export interface AdvancedSettings {
  id: number;

  // Application Settings
  max_applications_per_user: number;
  application_timeout_minutes: number;
  auto_reject_after_days: number;

  // Course & Enrollment Settings
  max_enrollments_per_user: number;
  course_inactivity_days: number;
  auto_mark_complete_threshold: number;

  // Discussion Settings
  max_discussion_length: number;
  allow_anonymous_discussions: boolean;
  require_moderation: boolean;

  // File Upload Settings
  max_file_size_mb: number;
  allowed_file_types: string[];
  max_video_size_mb: number;

  // Rate Limiting
  api_rate_limit_per_minute: number;
  login_attempts_before_lockout: number;
  lockout_duration_minutes: number;

  // Session & Security
  session_timeout_hours: number;
  require_email_verification: boolean;
  enable_2fa: boolean;
  password_min_length: number;

  // Integration Settings
  slack_webhook_url?: string;
  discord_webhook_url?: string;

  // Notification Settings
  enable_email_notifications: boolean;
  enable_push_notifications: boolean;
  daily_digest_time: string;

  // Maintenance Mode
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_allowed_ips?: string[];

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// ============================================================================
// CONFIGURATION HISTORY
// ============================================================================

export interface ConfigurationHistory {
  id: number;

  // Change Details
  table_name: string;
  record_id: number;
  action: 'create' | 'update' | 'delete' | 'import' | 'export';

  // Data Snapshot
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  changes?: Record<string, any>;

  // User & Context
  changed_by?: string;
  changed_by_email?: string;
  ip_address?: string;
  user_agent?: string;

  // Additional Context
  change_reason?: string;
  import_source?: string;

  // Metadata
  created_at: string;
}

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

export interface ConfigurationPreset {
  id: number;

  // Preset Information
  preset_name: string;
  description?: string;

  // Complete Configuration Bundle
  branding_config?: Partial<PlatformBranding>;
  settings_config?: Partial<PlatformSettings>;
  feature_flags_config?: Partial<FeatureFlag>[];
  email_templates_config?: Partial<EmailTemplate>[];
  advanced_settings_config?: Partial<AdvancedSettings>;

  // Preset Metadata
  is_default: boolean;
  is_public: boolean;

  // Creator Info
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Usage Tracking
  times_applied: number;
  last_applied_at?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PlatformConfig {
  branding: PlatformBranding;
  settings: PlatformSettings;
  advanced: AdvancedSettings;
}

export interface ConfigurationExport {
  version: string;
  exported_at: string;
  exported_by?: string;
  branding: PlatformBranding;
  settings: PlatformSettings;
  feature_flags: FeatureFlag[];
  email_templates: EmailTemplate[];
  advanced_settings: AdvancedSettings;
}

export interface ConfigurationImportResult {
  success: boolean;
  message: string;
  errors?: string[];
  imported_items?: {
    branding: boolean;
    settings: boolean;
    feature_flags: number;
    email_templates: number;
    advanced_settings: boolean;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ConfigResponse<T> {
  data: T;
  error?: string;
}

export interface FeatureFlagCheckResult {
  enabled: boolean;
  reason?: string;
}
