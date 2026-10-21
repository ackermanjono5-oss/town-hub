import type { OfferType } from '@/lib/rewards/types';

/** Everything the Business Rewards Portal registration form collects. */
export interface RegisterBusinessInput {
  registered_name: string;
  trading_name?: string;
  registration_number: string;
  /** "<source>:<id>" of the business's directory listing, if it has one. */
  directory_listing_id?: string;
  category?: string;
  description?: string;
  contact_name: string;
  phone: string;
  email: string;
  address?: string;
  town?: string;
  advertising_reference?: string;
  accept_terms: boolean;
}

/** Fields a business owner edits on its own offers. */
export interface OfferDraftInput {
  title: string;
  description?: string | null;
  terms?: string | null;
  purchase_conditions?: string | null;
  offer_type: OfferType;
  discount_value?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  monthly_limit: number;
}

export interface BusinessRedemptionRow {
  id: string;
  redeemed_at: string;
  period: string;
  offer: { title: string } | null;
  token: { code: string | null } | null;
}

export type ApproveResult =
  | 'VALID'
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'INVALID_TOKEN'
  | 'WRONG_BUSINESS'
  | 'OFFER_INACTIVE'
  | 'NOT_SUBSCRIBED'
  | 'LIMIT_REACHED'
  | 'BUSINESS_INELIGIBLE';

export interface ApproveRedemptionResponse {
  result: ApproveResult;
  message: string;
  offerTitle?: string | null;
  customerName?: string | null;
  code?: string | null;
  redeemedAt?: string;
  previewOnly?: boolean;
}

export type ApproveErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_A_BUSINESS_ACCOUNT'
  | 'BUSINESS_INACTIVE'
  | 'SERVER_ERROR';

export class ApproveRedemptionError extends Error {
  code: ApproveErrorCode;

  constructor(code: ApproveErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
