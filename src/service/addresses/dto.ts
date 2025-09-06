export type UpsertAddressDto = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zip?: string;
  isDefault?: boolean;
};
