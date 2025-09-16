import { User } from '@supabase/supabase-js';

export interface AuthFormData {
  email: string;
  password?: string;
  lastName?: string;
  firstName?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  gender?: string;
  phoneNumber?: string;
  nickname?: string;
  companyName?: string;
  companyAddress?: string;
  department?: string;
  position?: string;
  contactPhone?: string;
}

export interface AuthFormProps {
  onAuthSuccess: (email: string, name?: string, authUserId?: string) => void;
  initialMode?: 'signin' | 'signup';
}

export interface AuthContextType {
  session: any;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}