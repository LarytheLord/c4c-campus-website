/**
 * Type definitions for the messaging and communication system
 */

// ============================================================================
// MESSAGE THREADS AND DIRECT MESSAGING
// ============================================================================

export interface MessageThread {
  id: string; // UUID
  participant_ids: string[]; // UUID array
  subject?: string;
  last_message_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

export interface Message {
  id: string; // UUID
  thread_id: string; // UUID
  sender_id: string; // UUID
  content: string;
  attachments?: string[]; // TEXT[]
  read_by?: string[]; // UUID[]
  created_at: string; // ISO timestamp
}

export interface MessageReadReceipt {
  id: number;
  message_id: number;
  user_id: string; // UUID
  read_at: string; // ISO timestamp
}

export interface MessageAttachment {
  id: number;
  message_id: number;
  file_name: string;
  file_path: string;
  file_size: number; // bytes
  file_type?: string; // MIME type
  created_at: string; // ISO timestamp
}

export interface TypingIndicator {
  id: number;
  thread_id: number;
  user_id: string; // UUID
  is_typing: boolean;
  updated_at: string; // ISO timestamp
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export type AnnouncementTargetType = 'platform' | 'cohort' | 'course' | 'role';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: number;
  author_id: string; // UUID
  title: string;
  content: string;
  content_html?: string;
  target_type: AnnouncementTargetType;
  target_id?: number; // cohort_id or course_id
  target_role?: string; // 'student', 'teacher', 'admin'
  priority: AnnouncementPriority;
  is_pinned: boolean;
  scheduled_for?: string; // ISO timestamp
  sent_at?: string; // ISO timestamp
  send_email: boolean;
  email_sent_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface AnnouncementRecipient {
  id: number;
  announcement_id: number;
  user_id: string; // UUID
  read_at?: string; // ISO timestamp
  dismissed_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType =
  | 'message'
  | 'announcement'
  | 'discussion_reply'
  | 'mention'
  | 'course_update'
  | 'cohort_update'
  | 'application_update'
  | 'progress_milestone'
  | 'assignment_due'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string; // UUID
  user_id: string; // UUID
  type: NotificationType | string;
  title: string;
  content: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, any> | null;
  created_at: string; // ISO timestamp
}

export type DigestMode = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'off';

export interface NotificationPreferences {
  id: number;
  user_id: string; // UUID
  messages_email: boolean;
  messages_inapp: boolean;
  announcements_email: boolean;
  announcements_inapp: boolean;
  discussions_email: boolean;
  discussions_inapp: boolean;
  course_updates_email: boolean;
  course_updates_inapp: boolean;
  digest_mode: DigestMode;
  digest_time: string; // HH:MM:SS
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Message API
export interface SendMessageRequest {
  recipient_id: string; // UUID
  content: string;
  content_html?: string;
  attachments?: File[];
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  thread?: MessageThread;
  error?: string;
}

export interface GetConversationsRequest {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ConversationListItem {
  thread: MessageThread;
  other_participant: {
    id: string;
    name: string;
    email: string;
  };
  last_message?: Message;
  unread_count: number;
}

export interface GetConversationsResponse {
  success: boolean;
  conversations?: ConversationListItem[];
  total?: number;
  error?: string;
}

export interface GetThreadMessagesRequest {
  thread_id: number;
  limit?: number;
  before_id?: number; // For pagination
}

export interface GetThreadMessagesResponse {
  success: boolean;
  messages?: Message[];
  thread?: MessageThread;
  other_participant?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export interface MarkAsReadRequest {
  message_ids: number[];
}

export interface MarkAsReadResponse {
  success: boolean;
  marked_count?: number;
  error?: string;
}

// Announcements API
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  content_html?: string;
  target_type: AnnouncementTargetType;
  target_id?: number;
  target_role?: string;
  priority?: AnnouncementPriority;
  is_pinned?: boolean;
  scheduled_for?: string; // ISO timestamp
  send_email?: boolean;
}

export interface CreateAnnouncementResponse {
  success: boolean;
  announcement?: Announcement;
  recipient_count?: number;
  error?: string;
}

export interface GetAnnouncementsRequest {
  limit?: number;
  offset?: number;
  include_read?: boolean;
  priority?: AnnouncementPriority;
}

export interface AnnouncementListItem extends Announcement {
  author: {
    id: string;
    name: string;
  };
  is_read: boolean;
  recipient_info?: AnnouncementRecipient;
}

export interface GetAnnouncementsResponse {
  success: boolean;
  announcements?: AnnouncementListItem[];
  total?: number;
  unread_count?: number;
  error?: string;
}

// Notifications API
export interface GetNotificationsRequest {
  limit?: number;
  offset?: number;
  type?: NotificationType;
  unread_only?: boolean;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications?: Notification[];
  total?: number;
  unread_count?: number;
  error?: string;
}

export interface MarkNotificationsReadRequest {
  notification_ids?: number[]; // If empty, mark all as read
}

export interface MarkNotificationsReadResponse {
  success: boolean;
  marked_count?: number;
  error?: string;
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface InboxListProps {
  conversations: ConversationListItem[];
  selectedThreadId?: number;
  onSelectThread: (threadId: number) => void;
  onCompose: () => void;
  loading?: boolean;
}

export interface MessageThreadProps {
  threadId: number;
  messages: Message[];
  otherParticipant: {
    id: string;
    name: string;
    email: string;
  };
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onLoadMore?: () => void;
  isTyping?: boolean;
  loading?: boolean;
}

export interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipientId: string, content: string, attachments?: File[]) => Promise<void>;
  recipients: Array<{ id: string; name: string; email: string }>;
}

export interface NotificationBellProps {
  unreadCount: number;
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notificationId: number) => void;
}

export interface AnnouncementComposerProps {
  onSubmit: (announcement: CreateAnnouncementRequest) => Promise<void>;
  userRole: 'admin' | 'teacher';
  availableCohorts?: Array<{ id: number; name: string }>;
  availableCourses?: Array<{ id: number; name: string }>;
}

export interface AnnouncementFeedProps {
  announcements: AnnouncementListItem[];
  onMarkAsRead: (announcementId: number) => void;
  onDismiss: (announcementId: number) => void;
  loading?: boolean;
}

// ============================================================================
// REAL-TIME EVENTS
// ============================================================================

export interface RealtimeMessageEvent {
  type: 'new_message' | 'message_edited' | 'message_deleted';
  message: Message;
  thread_id: number;
}

export interface RealtimeTypingEvent {
  type: 'typing_start' | 'typing_stop';
  user_id: string;
  thread_id: number;
}

export interface RealtimeNotificationEvent {
  type: 'new_notification';
  notification: Notification;
}

export interface RealtimeAnnouncementEvent {
  type: 'new_announcement';
  announcement: Announcement;
}
