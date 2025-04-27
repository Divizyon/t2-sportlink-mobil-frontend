export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// Spor Tipi
export interface Sport {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  created_at: string;
  updated_at: string;
}

export interface SportResponse extends ApiResponse<Sport> {}
export interface SportsListResponse extends PaginatedResponse<Sport> {}

// Haber Tipi
export interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  source: string;
  source_url: string;
  sport_id: string;
  sport: Sport;
  created_at: string;
  updated_at: string;
}

export interface NewsResponse extends ApiResponse<News> {}
export interface NewsListResponse extends PaginatedResponse<News> {}

// Duyuru Tipi
export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  start_date: string;
  end_date: string;
  creator_id: string | null;
  creator: any | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementsData {
  announcements: Announcement[];
  pagination: Pagination;
}

export interface AnnouncementResponse extends ApiResponse<Announcement> {}
export interface AnnouncementsListResponse extends ApiResponse<AnnouncementsData> {}