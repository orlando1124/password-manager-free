export interface Credential {
  id?: string;
  site: string;
  username: string;
  password: string;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialFormData {
  site: string;
  username: string;
  password: string;
  category: string;
  notes: string;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordGeneratorOptions = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
};

export const CREDENTIAL_CATEGORIES = [
  'Social Media',
  'Work',
  'Banking',
  'Shopping',
  'Entertainment',
  'Education',
  'Other'
] as const;

export type CredentialCategory = typeof CREDENTIAL_CATEGORIES[number];
