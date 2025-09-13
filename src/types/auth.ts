export interface AuthFormData {
  email: string;
  password: string;
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
  contactPhone?: string; // 担当者電話用の新しいフィールド
}

export interface AuthFormProps {
  onAuthSuccess: (email: string, name?: string) => void;
  initialMode?: 'signin' | 'signup';
}

export type UserType = 'individual' | 'sponsor';
