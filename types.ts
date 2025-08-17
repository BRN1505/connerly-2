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

export enum CreatorCategory {
  BEAUTY = '美容',
  FASHION = 'ファッション',
  DIY = 'DIY',
  LEISURE = 'レジャー',
  SPORTS = 'スポーツ',
  FOOD = 'グルメ',
  TRAVEL = '旅行',
  GAMING = 'ゲーム',
  LIFESTYLE = 'ライフスタイル',
  OTHER = 'その他',
}

export interface SocialProfile {
    platform: string;
    profileUrl: string;
    followerCount: number;
}

export interface Creator {
  id: string;
  role: UserRole.CREATOR;
  name: string;
  email: string;
  password?: string;
  socials: SocialProfile[];
  categories: string[];
}

export type SubscriptionStatus = 'active' | 'inactive';

export interface Brand {
  id:string;
  role: UserRole.BRAND;
  name: string;
  email: string;
  password?: string;
  subscriptionStatus: SubscriptionStatus;
  cancellationReason?: string;
  cancellationFeedback?: string;
}

export interface Admin {
  id: string;
  role: UserRole.ADMIN;
  email: string;
  name: string;
  password?: string;
}

export type User = Creator | Brand | Admin;

export enum JobStatus {
    OPEN = '募集中',
    IN_PROGRESS = '進行中',
    CLOSED = '募集終了',
}

export type PaymentStatus = 'unpaid' | 'paid';

export interface Job {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  payment: number;
  numberOfCreators: number;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  applicants: string[]; // array of creator IDs
  selectedCreatorIds: string[];
}

export interface JobTemplate {
    title: string;
    description: string;
    category: string;
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

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}