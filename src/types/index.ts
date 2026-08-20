export interface Photo {
  id: string;
  coupleId: string;
  uploaderId: string;
  url: string;
  type: "image" | "video";
  createdAt: any;
  tags?: string[];
  isSecret?: boolean;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
}

export interface Capsule {
  id: string;
  coupleId: string;
  uploaderId: string;
  audioUrl: string;
  title: string;
  unlockDate: any; // timestamp
  createdAt: any;
}
