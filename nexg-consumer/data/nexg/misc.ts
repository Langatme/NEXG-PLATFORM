import type { AppNotification, Promotion } from '@/domain/types';

export const seedNotifications: AppNotification[] = [
  {
    id: 'notif_welcome',
    category: 'system',
    title: 'Welcome to NEXG',
    body: 'Almost everything, around you. Explore food, wellness, rides and stays.',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif_promo',
    category: 'promotions',
    title: 'KARIBU200: KSh 200 off',
    body: 'Apply KARIBU200 at checkout on your first order.',
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export const promotions: Promotion[] = [
  { id: 'promo_nexg10', code: 'NEXG10', headline: '10% off', subline: 'Up to KSh 300, all merchants', emoji: '🎉', verticals: ['food'] },
  { id: 'promo_karibu', code: 'KARIBU200', headline: 'KSh 200 off', subline: 'Your first order, karibu!', emoji: '👋', verticals: ['food'] },
];
