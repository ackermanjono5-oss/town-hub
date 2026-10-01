export interface RegisterBusinessInput {
  name: string;
  description?: string;
  category?: string;
}

export type ApproveResult =
  | 'VALID'
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'INVALID_TOKEN'
  | 'WRONG_BUSINESS'
  | 'OFFER_INACTIVE'
  | 'NOT_SUBSCRIBED';

export interface ApproveRedemptionResponse {
  result: ApproveResult;
  message: string;
  offerTitle?: string;
  businessName?: string;
  customerName?: string | null;
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
