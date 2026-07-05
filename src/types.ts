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
