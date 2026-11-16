import { describe, expect, it } from 'vitest';
import { formatPrice, listingStateLabel, validateListing, type ListingInput } from '@/lib/property/types';
import { fitWithin, photoPath } from '@/lib/property/photos';

const GOOD: ListingInput = {
  listing_type: 'sale',
  property_type: 'house',
  title: 'Family home near the beach',
  description: null,
  price: 2450000,
  bedrooms: 3,
  bathrooms: 2,
  garages: 1,
  floor_size: 180,
  erf_size: 600,
  town: 'plett',
  suburb: null,
  photos: [],
  agency_url: null,
  agent_name: null,
  agent_phone: null,
  agent_email: null,
};

describe('formatPrice', () => {
  it('groups rand with spaces', () => {
    expect(formatPrice(2450000, 'sale')).toBe('R 2 450 000');
  });
  it('adds "pm" for rentals', () => {
    expect(formatPrice(12500, 'rent')).toBe('R 12 500 pm');
  });
});

describe('validateListing', () => {
  it('accepts a complete listing', () => {
    expect(validateListing(GOOD)).toBeNull();
  });
  it('catches what the database would reject', () => {
    expect(validateListing({ ...GOOD, title: 'abc' })).toMatch(/title/);
    expect(validateListing({ ...GOOD, price: -5 })).toMatch(/price/);
    expect(validateListing({ ...GOOD, town: '' })).toMatch(/town/);
    expect(validateListing({ ...GOOD, photos: Array(7).fill('x') })).toMatch(/6 photos/);
    expect(validateListing({ ...GOOD, agency_url: 'javascript:alert(1)' })).toMatch(/http/);
    expect(validateListing({ ...GOOD, bedrooms: 99 })).toMatch(/Bedrooms/);
  });
});

describe('listingStateLabel', () => {
  it('describes each state', () => {
    expect(listingStateLabel({ status: 'submitted', is_sold: false, listing_type: 'sale' })).toBe('Waiting for Town Hub');
    expect(listingStateLabel({ status: 'approved', is_sold: false, listing_type: 'sale' })).toBe('Live');
    expect(listingStateLabel({ status: 'approved', is_sold: true, listing_type: 'sale' })).toBe('Sold');
    expect(listingStateLabel({ status: 'approved', is_sold: true, listing_type: 'rent' })).toBe('Let');
    expect(listingStateLabel({ status: 'rejected', is_sold: false, listing_type: 'sale' })).toBe('Needs changes');
  });
});

describe('photo helpers', () => {
  it('scales big photos down and leaves small ones', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
  it('finds the storage path in a public URL', () => {
    expect(
      photoPath('https://x.supabase.co/storage/v1/object/public/property-photos/uid-1/123-abc.jpg')
    ).toBe('uid-1/123-abc.jpg');
  });
});
