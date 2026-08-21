export type CategoryType = 'all' | 'urgent' | 'general' | 'improvements' | 'uk_news' | 'events';

export interface User {
  id: string;
  name: string;
  avatar: string;
  address: string;
  building: string;
  entrance: number;
  apartment: number;
  verified: boolean;
  verifiedMethod?: string;
  rating: number;
  thanksCount: number;
  joinedDate: string;
  bio: string;
  country?: 'BY' | 'KZ';
  city?: string;
  phone: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorAddress: string;
  verified: boolean;
  content: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
  replyToUser?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorAddress: string;
  verified: boolean;
  timestamp: string;
  category: CategoryType;
  title?: string;
  content: string;
  images?: string[];
  likes: number;
  userLiked?: boolean;
  comments: Comment[];
  poll?: Poll;
  pinned?: boolean;
  tags?: string[];
  locationTag?: string;
}

export interface MarketItem {
  id: string;
  title: string;
  price: number; // 0 means free / "Отдам даром"
  category: 'free' | 'furniture' | 'kids' | 'electronics' | 'auto' | 'repairs' | 'other';
  description: string;
  image: string;
  sellerName: string;
  sellerAvatar: string;
  sellerAddress: string;
  sellerVerified: boolean;
  status: 'available' | 'reserved' | 'sold';
  condition: 'new' | 'like_new' | 'used';
  date: string;
  views: number;
}

export interface MasterService {
  id: string;
  name: string;
  avatar: string;
  category: string;
  categorySlug: 'plumbing' | 'electric' | 'nanny' | 'pets' | 'tutor' | 'repairs' | 'beauty';
  rating: number;
  reviewsCount: number;
  verifiedNeighbor: boolean;
  address: string;
  phone: string;
  priceStarting: string;
  description: string;
  skills: string[];
  badges: string[];
}

export interface MapMarker {
  id: string;
  title: string;
  type: 'incident' | 'event' | 'free_item' | 'master' | 'community_spot' | 'lost_pet' | 'harvest' | 'sale_item';
  lat: number;
  lng: number;
  description: string;
  author: string;
  date?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderAddress: string;
  verified: boolean;
  text: string;
  timestamp: string;
  image?: string;
  replyTo?: string;
}

export interface HouseChat {
  id: string;
  name: string;
  description: string;
  icon: string;
  membersCount: number;
  unreadCount: number;
  type: 'house' | 'entrance' | 'auto' | 'pets' | 'moms' | 'direct';
  participantAvatar?: string;
  participantAddress?: string;
  messages: ChatMessage[];
}

export interface NeighborhoodInfo {
  id: string;
  name: string; // e.g. "ЖК Лиговский Сити"
  city: string;
  district: string;
  housesCount: number;
  residentsCount: number;
  activeAnnouncements: number;
  coverImage: string;
}
