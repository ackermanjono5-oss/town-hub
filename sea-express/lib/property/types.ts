export type ListingType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'vacant_land' | 'farm' | 'commercial';
export type ListingStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'vacant_land', label: 'Vacant land' },
  { value: 'farm', label: 'Farm' },
  { value: 'commercial', label: 'Commercial' },
];

export const MAX_PHOTOS = 6;

export interface PropertyListing {
  id: string;
  business_id: string;
  created_by: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  title: string;
  description: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  floor_size: number | null;
  erf_size: number | null;
  town: string;
  suburb: string | null;
  photos: string[];
  agency_url: string | null;
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  agency_name: string | null;
  status: ListingStatus;
  is_sold: boolean;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** What the agency fills in. */
export type ListingInput = Pick<
  PropertyListing,
  | 'listing_type'
  | 'property_type'
  | 'title'
  | 'description'
  | 'price'
  | 'bedrooms'
  | 'bathrooms'
  | 'garages'
  | 'floor_size'
  | 'erf_size'
  | 'town'
  | 'suburb'
  | 'photos'
  | 'agency_url'
  | 'agent_name'
  | 'agent_phone'
  | 'agent_email'
>;

export function propertyTypeLabel(value: string): string {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value;
}

/** "R 2 450 000", or "R 12 500 pm" for rentals. */
export function formatPrice(price: number, type: ListingType): string {
  // Grouped by hand: Intl's en-ZA output varies between WebView versions (and uses a no-break space).
  const amount = String(Math.round(price)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return type === 'rent' ? `R ${amount} pm` : `R ${amount}`;
}

/** What's wrong with a draft listing, or null when it can be submitted. Mirrors the table's checks. */
export function validateListing(input: ListingInput): string | null {
  const title = input.title.trim();
  if (title.length < 5) return 'Give the listing a title of at least 5 characters.';
  if (title.length > 120) return 'Keep the title under 120 characters.';
  if (!Number.isFinite(input.price) || input.price < 0) return 'Enter the price in rand.';
  if (!input.town) return 'Choose the town.';
  if ((input.description ?? '').length > 4000) return 'Keep the description under 4000 characters.';
  if (input.photos.length > MAX_PHOTOS) return `Add up to ${MAX_PHOTOS} photos.`;
  if (input.agency_url && !/^https?:\/\//i.test(input.agency_url)) {
    return 'The agency link must start with http:// or https://';
  }
  for (const [field, label] of [
    ['bedrooms', 'Bedrooms'],
    ['bathrooms', 'Bathrooms'],
    ['garages', 'Garages'],
  ] as const) {
    const v = input[field];
    if (v != null && (v < 0 || v > 50)) return `${label} must be between 0 and 50.`;
  }
  return null;
}

/** How a listing's state reads to the agency. */
export function listingStateLabel(listing: Pick<PropertyListing, 'status' | 'is_sold' | 'listing_type'>): string {
  if (listing.status === 'approved' && listing.is_sold) return listing.listing_type === 'rent' ? 'Let' : 'Sold';
  switch (listing.status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Waiting for Town Hub';
    case 'approved':
      return 'Live';
    case 'rejected':
      return 'Needs changes';
  }
}
