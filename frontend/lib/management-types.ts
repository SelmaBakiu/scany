export type ManagedStore = {
  id: string;
  name: string;
  slug: string;
  baseCurrency: string;
  defaultLocale: string;
  isPublished: boolean;
  ownerEmail: string;
};

export type ManagementReference = {
  value: string;
  label: string;
};

export type StoreManagementData = {
  stores: ManagedStore[];
  currencies: ManagementReference[];
  locales: ManagementReference[];
};

export type ManagementActionState = {
  ok: boolean;
  message: string;
};

export const EMPTY_MANAGEMENT_RESULT: ManagementActionState = { ok: false, message: "" };
