// Define UUID type for consistent usage
export type UUID = string;

// Language code type for user preferences
export type LanguageCode = 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh';

// Auth model representing the authentication session
export interface AuthModel {
  access_token: string;
  refresh_token?: string;
  user?: string | any; // Can be string or object based on backend
}

// User model representing the user profile
export interface UserModel {
  username: string;
  password?: string; // Optional as we don't always retrieve passwords
  email: string;
  first_name: string;
  last_name: string;
  fullname?: string; // May be stored directly in metadata
  email_verified?: boolean;
  occupation?: string;
  company_name?: string; // Using snake_case consistently
  phone?: string;
  roles?: number[]; // Array of role IDs
  pic?: string;
  language?: LanguageCode; // Maintain existing type
  is_admin?: boolean; // Added admin flag
}
// Auth state for Redux or context state management
export interface AuthState {
  loading: boolean;
  auth?: AuthModel;
  error?: string | null;
  twoFactorRequired: boolean;
  pendingEmail: string | null;
  otpExpiresInMinutes: number | null;
  otpExpireAt?: number | null;
}
