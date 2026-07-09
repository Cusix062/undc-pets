/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  gender: 'male' | 'female' | 'group';
  age: string;
  status: string; // e.g., "Buscando hogar", "Sano", "En tratamiento", "Vacunado", "Esterilizada", "Saludable"
  statusType: 'success' | 'warning' | 'error' | 'info' | 'primary';
  tags: string[];
  description: string;
  image: string;
  story: string;
  reportedBy?: string;
  contactEmail?: string;
  location?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  userId?: string;
  content: string;
  timeAgo: string;
}

export interface Post {
  id: string;
  userId?: string;
  userAvatar?: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  avatarColor: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  timeAgo: string;
  isCampusFavorite?: boolean;
  tag?: string;
  likedByUser?: boolean;
  sharedBy?: string[];
}

export interface DonationCampana {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  urgency: string;
  image?: string;
}

export interface DonationAccount {
  bank: string;
  number: string;
  CCI: string;
}

export interface PendingDonation {
  id: string;
  campaignId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface DonationConfig {
  accounts: DonationAccount[];
  yapeNumber: string;
  plinNumber: string;
  qrCodes: {
    yape: string;
    plin: string;
    bcp: string;
    tunqui: string;
  };
  campaigns: DonationCampana[];
  pendingDonations: PendingDonation[];
}
