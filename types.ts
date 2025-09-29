
export enum UserRole {
  CREATOR = 'creator',
  BRAND = 'brand',
  ADMIN = 'admin',
}

export enum Page {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  GUEST = 'guest',
}

export enum JobStatus {
  OPEN = '募集中',
  IN_PROGRESS = '進行中',
  CLOSED = '募集終了',
}

export enum CreatorCategory {
  FASHION = 'ファッション',
  BEAUTY = '美容',
  FOOD = 'グルメ',
  TRAVEL = '旅行',
  GAMING = 'ゲーム',
  DIY = 'DIY・ハンドメイド',
  OTHER = 'その他',
}

export interface SocialProfile {
  platform: string;
  followerCount: number;
  profileUrl: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
}

export interface Creator extends User {
  role: UserRole.CREATOR;
  socials: SocialProfile[];
  categories: string[];
}

export type SubscriptionStatus = 'active' | 'inactive';

export interface Brand extends User {
  role: UserRole.BRAND;
  subscriptionStatus: SubscriptionStatus;
  cancellationReason?: string;
  cancellationFeedback?: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
}

export type PaymentStatus = 'paid' | 'unpaid';

export interface Job {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  payment: number;
  numberOfCreators: number;
  status: JobStatus;
  createdAt: Date;
  applicants: string[]; // array of creator IDs
  selectedCreatorIds: string[];
  paymentStatus: PaymentStatus;
}

export enum ScoutOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export interface ScoutOffer {
  id: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  jobId: string;
  message: string;
  status: ScoutOfferStatus;
  createdAt: Date;
}

export interface ChatMessage {
    id: string;
    jobId: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
}

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface InboxNotification {
    id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
