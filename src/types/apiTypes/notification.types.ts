export type NotificationType = 'event' | 'news' | 'friend_request' | 'message' | 'system' | 'announcement';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
  is_read: boolean;
  redirect_url?: string;
  event_id?: string;
  created_at: string;
  expires_at?: string;
  event?: {
    id: string;
    title: string;
    event_date: string;
  } | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationCountResponse {
  count: number;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  newEventNearby: boolean;
  eventReminder: boolean;
  eventCanceled: boolean;
  eventChanged: boolean;
  newFollower: boolean;
  newComment: boolean;
  directMessage: boolean;
  mention: boolean;
  appUpdates: boolean;
  tipsEnabled: boolean;
}

export interface DeviceTokenInput {
  token: string;
  platform: 'ios' | 'android' | 'expo';
} 