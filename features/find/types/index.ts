export interface Event {
  id: string | number;
  title: string;
  sportType: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  participantCount: number;
  maxParticipants: number;
  creatorName: string;
  creatorImage: string;
  imageUrl?: string;
  participants?: string;
  creator?: string;
  description?: string;
}

export interface Facility {
  id: string;
  name: string;
  sportType: string;
  type?: string;
  imageUrl: string;
  location: string;
  address?: string;
  distance: string;
  rating?: number;
  openHours?: string;
  image?: string;
}

export interface Partner {
  id: string;
  name: string;
  age: number;
  distance: string;
  sport: string;
  avatar: string | null;
  preferredSports?: string[];
}

export interface SearchItem {
  id: number;
  title: string;
  type: string;
  sportType: string;
  location: string;
}
