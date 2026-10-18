export type LegalNoticeCategory =
  | 'deceased_estate'
  | 'claim'
  | 'liquidation'
  | 'insolvency'
  | 'tender';

export const LEGAL_NOTICE_CATEGORIES: {
  value: LegalNoticeCategory;
  label: string;
  description: string;
}[] = [
  {
    value: 'deceased_estate',
    label: 'Deceased Estates',
    description: 'Notices relating to people who have passed away.',
  },
  {
    value: 'claim',
    label: 'Claims',
    description: 'Claims against a company, estate or other party.',
  },
  {
    value: 'liquidation',
    label: 'Liquidation Notices',
    description: 'Companies being liquidated.',
  },
  {
    value: 'insolvency',
    label: 'Insolvency Notices',
    description: 'Matters involving insolvency.',
  },
  {
    value: 'tender',
    label: 'Tender Notices',
    description: 'Invitations to submit tenders.',
  },
];

export function getLegalNoticeCategoryLabel(category: LegalNoticeCategory): string {
  return LEGAL_NOTICE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export interface LegalNotice {
  id: string;
  category: LegalNoticeCategory;
  title: string;
  body: string;
  town: string | null;
  firm_name: string | null;
  reference: string | null;
  contact: string | null;
  published_on: string;
  closes_on: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateLegalNoticeInput {
  category: LegalNoticeCategory;
  title: string;
  body: string;
  town?: string | null;
  firm_name?: string | null;
  reference?: string | null;
  contact?: string | null;
  published_on?: string;
  closes_on?: string | null;
}
