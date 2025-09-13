import { supabase } from '../lib/supabaseClient';

export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year);
  }
  return years;
};

export const generateMonths = () => {
  return Array.from({ length: 12 }, (_, i) => i + 1);
};

export const generateDays = (year?: string, month?: string) => {
  if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
  
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  return Array.from({ length: lastDay }, (_, i) => i + 1);
};

export const formatBirthDate = (year?: string, month?: string, day?: string) => {
  if (!year || !month || !day) return '';
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  return `${year}-${formattedMonth}-${formattedDay}`;
};

export const calculatePasswordStrength = (password: string): { strength: number; message: string } => {
  if (!password) return { strength: 0, message: '' };

  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  const normalizedScore = Math.min(3, Math.floor(score / 2));
  
  let message = '';
  if (normalizedScore === 0) message = '弱いパスワード';
  else if (normalizedScore === 1) message = '普通のパスワード';
  else if (normalizedScore === 2) message = '強いパスワード';
  else message = '非常に強いパスワード';
  
  return { strength: normalizedScore, message };
};

export const checkMemberExists = async (userId: string) => {
  try {
    // まず個人ユーザーテーブルをチェック
    const { data: individualMember } = await supabase
      .from('individual_members')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (individualMember) {
      return { ...individualMember, user_type: 'individual' };
    }

    // 次に企業ユーザーテーブルをチェック
    const { data: sponsorMember } = await supabase
      .from('sponsor_members')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (sponsorMember) {
      return { ...sponsorMember, user_type: 'sponsor' };
    }

    return null;
  } catch (error) {
    console.error('Error in checkMemberExists:', error);
    return null;
  }
};

export const handleGoogleAuth = async () => {
  console.log('Starting Google authentication');
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    
    if (error) throw error;
    console.log('Google auth initiated');
  } catch (error) {
    console.error('Google authentication error:', error);
    alert('Google認証エラーが発生しました');
  }
};
