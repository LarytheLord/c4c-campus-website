/**
 * Supabase realtime messaging utilities for C4C Campus
 * @module lib/realtime
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: unknown) => void;

/**
 * Manager for real-time messaging subscriptions
 */
export class MessagingRealtimeManager {
  private supabase: SupabaseClient;
  private userId: string;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(supabase: SupabaseClient, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  /**
   * Subscribe to inbox updates (new messages in threads)
   * @param callback - Callback when inbox changes
   */
  subscribeToInbox(callback: SubscriptionCallback): void {
    const channelName = `inbox:${this.userId}`;

    if (this.channels.has(channelName)) {
      return;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
          filter: `participant_ids=cs.{${this.userId}}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to inbox updates');
        }
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to notification updates
   * @param callback - Callback when new notification arrives
   */
  subscribeToNotifications(callback: SubscriptionCallback): void {
    const channelName = `notifications:${this.userId}`;

    if (this.channels.has(channelName)) {
      return;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to notifications');
        }
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to a specific message thread
   * @param threadId - Thread ID to subscribe to
   * @param callback - Callback for new messages
   */
  subscribeToThread(threadId: string, callback: SubscriptionCallback): void {
    const channelName = `thread:${threadId}`;

    if (this.channels.has(channelName)) {
      return;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        callback({ ...payload, type: 'typing' });
      })
      .subscribe();

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to discussion updates for a lesson/cohort
   * @param lessonId - Lesson ID
   * @param cohortId - Cohort ID
   * @param callback - Callback for discussion updates
   */
  subscribeToDiscussion(
    lessonId: number,
    cohortId: string,
    callback: SubscriptionCallback
  ): void {
    const channelName = `discussion:${lessonId}:${cohortId}`;

    if (this.channels.has(channelName)) {
      return;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_discussions',
          filter: `lesson_id=eq.${lessonId},cohort_id=eq.${cohortId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
  }

  /**
   * Unsubscribe from a specific channel
   * @param channelName - Name of channel to unsubscribe
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    for (const [, channel] of this.channels) {
      this.supabase.removeChannel(channel);
    }
    this.channels.clear();
    console.log('Unsubscribed from all realtime channels');
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.channels.size;
  }
}

/**
 * Send a typing indicator to a thread
 * @param supabase - Supabase client
 * @param threadId - Thread ID
 * @param userId - User ID of person typing
 */
export async function sendTypingIndicator(
  supabase: SupabaseClient,
  threadId: string,
  userId: string
): Promise<void> {
  const channelName = `thread:${threadId}`;

  const channel = supabase.channel(channelName);

  await channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      userId,
      threadId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Create a presence channel for online status
 * @param supabase - Supabase client
 * @param roomId - Room/course/cohort ID
 * @param userId - User ID
 * @param onSync - Callback when presence syncs
 */
export function createPresenceChannel(
  supabase: SupabaseClient,
  roomId: string,
  userId: string,
  onSync: (users: string[]) => void
): RealtimeChannel {
  const channel = supabase.channel(`presence:${roomId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUsers = Object.keys(state);
      onSync(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return channel;
}

export default MessagingRealtimeManager;
