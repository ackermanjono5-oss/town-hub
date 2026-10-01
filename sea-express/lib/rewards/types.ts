export type ProfileRole = 'customer' | 'business_owner' | 'employee' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  is_subscribed: boolean;
  /** Avatar id from components/Avatar.tsx, or null for initials. */
  avatar: string | null;
  /** Public URL of an uploaded photo. Takes precedence over `avatar`. */
  avatar_url: string | null;
  /** Town slug from lib/garden-route/towns.ts. */
  home_town: string | null;
  phone: string | null;
  created_at: string | null;
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  is_active: boolean;
}

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address: string | null;
  town: string | null;
}

export type OfferType = 'percentage_discount' | 'fixed_discount' | 'bogo' | 'free_item';

export interface Offer {
  id: string;
  business_id: string;
  branch_id: string | null;
  title: string;
  description: string | null;
  offer_type: OfferType;
  discount_value: number | null;
  terms: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface OfferWithBusiness extends Offer {
  business: Business;
}

export type TokenStatus = 'available' | 'used' | 'expired';

export interface RedemptionToken {
  id: string;
  customer_id: string;
  business_id: string;
  offer_id: string;
  period: string;
  status: TokenStatus;
  issued_at: string;
  expires_at: string;
  used_at: string | null;
}

// Mirrors supabase/functions/redeem-offer/index.ts's response shape —
// kept in sync manually since Deno and Next.js are separate runtimes.
export interface RedeemOfferResponse {
  tokenId: string;
  qrToken: string;
  status: TokenStatus;
  period: string;
  issuedAt: string;
  expiresAt: string;
}

export type RedeemErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_SUBSCRIBED'
  | 'OFFER_UNAVAILABLE'
  | 'ALREADY_REDEEMED'
  | 'SERVER_ERROR';

export class RedeemOfferError extends Error {
  code: RedeemErrorCode;

  constructor(code: RedeemErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
