import type { User, Session } from '@supabase/supabase-js';

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
  onAuthSuccess: (user: { id: string; email?: string; [key: string]: any }, userType: 'individual' | 'sponsor') => void;
  initialMode?: 'signin' | 'signup';
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}