export const CURRENCY = 'KES';

/**
 * Formats an amount in Kenyan Shillings.
 * All monetary values in the domain are plain numbers representing KES.
 */
export const formatKes = (amount: number, opts?: { compact?: boolean }): string => {
  if (opts?.compact && amount >= 1000) {
    const k = amount / 1000;
    return `KSh ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
};

export interface FeeBreakdown {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export const SERVICE_FEE = 49;

/** Distance-based delivery fee in KES: KSh 150 within 3km, +KSh 60/km beyond. */
export const calculateDeliveryFee = (distanceKm: number = 2.5): number => {
  if (distanceKm <= 0) return 0;
  const fee = distanceKm <= 3 ? 150 : 150 + (distanceKm - 3) * 60;
  return Math.round(fee);
};

interface Promo {
  readonly label: string;
  readonly percentOff?: number;
  readonly amountOff?: number;
  readonly maxDiscount?: number;
}

const promoFor = (code: string): Promo | undefined => {
  switch (code.toUpperCase()) {
    case 'NEXG10':
      return { label: '10% off (up to KSh 300)', percentOff: 10, maxDiscount: 300 };
    case 'KARIBU200':
      return { label: 'KSh 200 off your first order', amountOff: 200 };
    default:
      return undefined;
  }
};

export const calculatePromoDiscount = (
  code: string | null,
  subtotal: number
): number => {
  if (!code) return 0;
  const promo = promoFor(code);
  if (!promo) return 0;
  let discount = 0;
  if (promo.percentOff) discount = Math.round((subtotal * promo.percentOff) / 100);
  if (promo.amountOff) discount = promo.amountOff;
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  return Math.min(discount, subtotal);
};

export const buildFeeBreakdown = (params: {
  subtotal: number;
  distanceKm?: number;
  isDelivery: boolean;
  promoCode?: string | null;
}): FeeBreakdown => {
  const deliveryFee = params.isDelivery ? calculateDeliveryFee(params.distanceKm) : 0;
  const discount = calculatePromoDiscount(params.promoCode ?? null, params.subtotal);
  const total = params.subtotal + SERVICE_FEE + deliveryFee - discount;
  return {
    subtotal: params.subtotal,
    serviceFee: SERVICE_FEE,
    deliveryFee,
    discount,
    total,
  };
};
