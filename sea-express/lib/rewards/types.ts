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

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'suspended';
export type AdvertiserStatus = 'active' | 'expired' | 'not_advertiser' | 'needs_verification';

export interface Business {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  is_active: boolean;
  // Registration details and eligibility (migration 0011). Optional because
  // customer-facing queries don't select them.
  owner_id?: string | null;
  registered_name?: string | null;
  trading_name?: string | null;
  registration_number?: string | null;
  directory_listing_id?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  town?: string | null;
  advertising_reference?: string | null;
  terms_accepted_at?: string | null;
  approval_status?: ApprovalStatus;
  approval_note?: string | null;
  advertiser_status?: AdvertiserStatus;
  advertising_paid_until?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
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
  status: OfferStatus;
  /** Redemptions allowed per customer per calendar month. */
  monthly_limit: number;
  purchase_conditions: string | null;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at?: string;
}

export type OfferStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

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
  /** Short code staff type in, e.g. K7PM3QXH (shown as K7PM-3QXH). */
  code: string | null;
  /** The offer's title and terms as they were when the voucher was issued. */
  offer_title: string | null;
  offer_terms: string | null;
}

// Mirrors supabase/functions/redeem-offer/index.ts's response shape —
// kept in sync manually since Deno and Next.js are separate runtimes.
export interface RedeemOfferResponse {
  tokenId: string;
  code: string;
  qrToken: string;
  offerTitle?: string | null;
  status: TokenStatus;
  period: string;
  issuedAt: string;
  expiresAt: string;
}

export type RedeemErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_SUBSCRIBED'
  | 'PROFILE_INCOMPLETE'
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
