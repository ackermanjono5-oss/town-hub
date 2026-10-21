import type { OfferWithBusiness } from './types';

// Demo mode is a build-time flag used ONLY for the offline mockup APK
// (and local demos). When false — which is every normal web build — none
// of this data is reachable and the real Supabase-backed flow runs
// unchanged. NEXT_PUBLIC_* is inlined by Next at build time, so this is a
// genuine build-time switch, not a runtime one.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_REWARDS === 'true';

export interface DemoOffer extends OfferWithBusiness {
  coupon_code: string;
  app_line: string;
  validity: string;
  redemption_rule: string;
  phone: string;
}

const PHONE = '010 011 2423';
const REDEMPTION_RULE = 'Show / bring your app coupon in-store to redeem.';

function business(
  id: string,
  name: string,
  category: string,
  description: string
): OfferWithBusiness['business'] {
  return { id, name, description, logo_url: null, category, is_active: true };
}

// The approval-workflow fields are the same on every demo offer — each is a
// live, approved, once-a-month reward — so they're filled in below.
type DemoWorkflowFields = 'status' | 'monthly_limit' | 'purchase_conditions' | 'review_note' | 'submitted_at' | 'reviewed_at';

const DEMO_OFFER_DATA: Omit<DemoOffer, DemoWorkflowFields>[] = [
  {
    id: 'demo-restaurant',
    business_id: 'demo-biz-restaurant',
    branch_id: null,
    title: '10% off your bill',
    description: 'From quality to great tastes — enjoy 10% off your total bill.',
    offer_type: 'percentage_discount',
    discount_value: 10,
    terms: 'One redemption per customer per calendar month.',
    starts_at: null,
    ends_at: null,
    is_active: true,
    business: business('demo-biz-restaurant', 'Restaurant', 'Restaurant', 'From quality to great tastes'),
    coupon_code: 'THR-REST-10OFF',
    app_line: '10% off your bill — once a month',
    validity: 'Once per customer per calendar month',
    redemption_rule: REDEMPTION_RULE,
    phone: PHONE,
  },
  {
    id: 'demo-tyres',
    business_id: 'demo-biz-tyres',
    branch_id: null,
    title: '7.5% off new tyres',
    description: 'Hankook & Hokohum brands this month. Tyres, mags, balancing, fitment and alignment.',
    offer_type: 'percentage_discount',
    discount_value: 7.5,
    terms: 'Valid on new tyres only. One redemption per customer this month.',
    starts_at: null,
    ends_at: null,
    is_active: true,
    business: business('demo-biz-tyres', 'Tyre & Mags Shop', 'Automotive', 'Tyres, mags, balancing & alignment'),
    coupon_code: 'THR-TYRE-75NEW',
    app_line: '7.5% off new Hankook & Hokohum tyres',
    validity: 'This calendar month, once per customer',
    redemption_rule: 'Show / bring your app coupon at the fitment desk.',
    phone: PHONE,
  },
  {
    id: 'demo-clothing',
    business_id: 'demo-biz-clothing',
    branch_id: null,
    title: '5% off all swimwear',
    description: 'We fit you straight into quality — mens, ladies, kids and accessories.',
    offer_type: 'percentage_discount',
    discount_value: 5,
    terms: 'September only. One redemption per customer.',
    starts_at: null,
    ends_at: null,
    is_active: true,
    business: business('demo-biz-clothing', 'Clothing Store', 'Retail', 'We fit you straight into quality'),
    coupon_code: 'THR-CLTH-5SWIM',
    app_line: '5% off all swimwear — September only',
    validity: 'September only, once per customer',
    redemption_rule: 'Show / bring your app coupon at the till.',
    phone: PHONE,
  },
  {
    id: 'demo-barber',
    business_id: 'demo-biz-barber',
    branch_id: null,
    title: 'Free shave with every haircut',
    description: 'More than a cut, it’s a lifestyle. Haircuts, beard trim, full shave, hot toweling.',
    offer_type: 'free_item',
    discount_value: null,
    terms: 'Free shave included with any haircut. One redemption per customer per month.',
    starts_at: null,
    ends_at: null,
    is_active: true,
    business: business('demo-biz-barber', 'Unique Barber Shop', 'Grooming', 'Great style for men'),
    coupon_code: 'THR-BARB-FRSHV',
    app_line: 'Free shave with every haircut',
    validity: 'Once per customer per calendar month',
    redemption_rule: 'Show / bring your app coupon before the cut.',
    phone: PHONE,
  },
  {
    id: 'demo-produce',
    business_id: 'demo-biz-produce',
    branch_id: null,
    title: '5% off all strawberries',
    description: 'Fresh fruit & veg straight from the farmer. Local farmers, stronger communities.',
    offer_type: 'percentage_discount',
    discount_value: 5,
    terms: 'Valid on strawberries this month. One redemption per customer.',
    starts_at: null,
    ends_at: null,
    is_active: true,
    business: business('demo-biz-produce', 'Fresh Produce', 'Grocer', 'We give you the real quality foods'),
    coupon_code: 'THR-FRSH-5STRW',
    app_line: '5% off all strawberries this month',
    validity: 'This calendar month, once per customer',
    redemption_rule: 'Show / bring your app coupon at the till.',
    phone: PHONE,
  },
];

export const DEMO_OFFERS: DemoOffer[] = DEMO_OFFER_DATA.map((offer) => ({
  ...offer,
  status: 'approved',
  monthly_limit: 1,
  purchase_conditions: null,
  review_note: null,
  submitted_at: null,
  reviewed_at: null,
}));

export function getDemoOffer(offerId: string): DemoOffer | null {
  return DEMO_OFFERS.find((offer) => offer.id === offerId) ?? null;
}

// A stand-in for the real HMAC-signed token from the redeem-offer Edge
// Function. Demo builds have no backend, so this is generated locally and
// is deliberately prefixed DEMO so a scan can never be mistaken for a
// genuine redemption token.
export function demoQrPayload(offer: DemoOffer): string {
  const period = new Date().toISOString().slice(0, 7);
  return `DEMO.${offer.coupon_code}.${period}.${Math.random().toString(36).slice(2, 10)}`;
}

export const DEMO_TOKEN_TTL_MS = 8 * 60 * 1000;
