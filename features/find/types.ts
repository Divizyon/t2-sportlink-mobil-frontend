export interface Facility {
  id: string;
  name: string;
  sportType: string;
  imageUrl: string;
  location: string;
  distance: string;
  rating?: number;
  openHours?: string;
}

export interface Event {
  id: string;
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
}
