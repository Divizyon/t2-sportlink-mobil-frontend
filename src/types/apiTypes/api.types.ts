export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  data: {
    pagination: Pagination;
  } & T;
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
export interface SportsListResponse extends PaginatedResponse<{sports: Sport[]}> {}

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
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsData {
  news: News[];
  pagination: Pagination;
  sports?: Sport[];
}

export interface NewsResponse extends ApiResponse<News> {}
export interface NewsListResponse extends ApiResponse<NewsData> {}

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