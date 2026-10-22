import type { Business, OfferType } from '@/lib/rewards/types';

export interface BusinessWithOwner extends Business {
  owner: { full_name: string | null } | null;
}

export interface RegistrationCode {
  code: string;
  business_id: string;
  is_used: boolean;
  created_at: string;
}

export interface AdminRedemptionRow {
  id: string;
  redeemed_at: string;
  period: string;
  business: { name: string } | null;
  offer: { title: string } | null;
  customer: { full_name: string | null } | null;
}

/** A row from public.admin_list_members() (migration 0012). */
export interface AdminMemberRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  home_town: string | null;
  role: string;
  is_subscribed: boolean;
  created_at: string;
}

export interface CreateBusinessInput {
  name: string;
  description?: string;
  category?: string;
}

export interface CreateOfferInput {
  business_id: string;
  title: string;
  description?: string;
  offer_type: OfferType;
  discount_value?: number;
  terms?: string;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
  monthly_limit?: number;
}
