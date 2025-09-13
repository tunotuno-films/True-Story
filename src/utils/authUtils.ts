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

export const getRedirectURL = () => {
  // 1) ローカル開発用に明示的な env を優先（.env.local に設定してください）
  if (typeof process !== 'undefined' && process?.env?.REACT_APP_SITE_URL) {
    return String(process.env.REACT_APP_SITE_URL).replace(/\/$/, '');
  }

  // 2) Vite 等の import.meta.env をチェック（デプロイ環境）
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv.VITE_SITE_URL) return String(metaEnv.VITE_SITE_URL).replace(/\/$/, '');
    if (metaEnv.REACT_APP_SITE_URL) return String(metaEnv.REACT_APP_SITE_URL).replace(/\/$/, '');
    if (metaEnv.SITE_URL) return String(metaEnv.SITE_URL).replace(/\/$/, '');
  }

  // 3) ブラウザ実行時かつローカルホストなら現在の origin を最優先（ポートも含む）
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const origin = String(window.location.origin).replace(/\/$/, '');
    if (
      hostname.includes('localhost') ||
      hostname.startsWith('127.') ||
      hostname === '::1'
    ) {
      return origin;
    }
  }

  // 4) 最後のフォールバックは本番URL
  return 'https://www.truestory.jp';
};

export const handleGoogleAuth = async () => {
  const base = getRedirectURL();
  const redirectTo = `${base.replace(/\/$/, '')}/mypage`; // 認証後は /mypage に戻す

  // デバッグログを強化：Supabase に渡す redirectTo を明示表示します
  console.info('[authUtils] Google auth redirectTo ->', redirectTo);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      console.error('Google auth error:', error);
    }
  } catch (err) {
    console.error('Unexpected error during Google auth:', err);
  }
};

// 追加: 冗長なサインアウト処理を共通化
export const robustSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Supabase signOut returned error:', error);
      // ここではエラーをそのまま続行してフォールバック処理へ進める
    }
  } catch (err) {
    console.warn('Supabase signOut threw error:', err);
    // 続行してフォールバック処理へ
  } finally {
    // localStorage はブラウザ環境でのみ利用可能なため、存在チェックを行う
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        Object.keys(window.localStorage).forEach((k) => {
          const key = String(k);
          const lower = key.toLowerCase();
          // supabase-js v2 uses keys like "sb-<project_ref>-auth-token"
          // older versions used "supabase." prefix. Remove either.
          if (lower.startsWith('sb-') || lower.startsWith('supabase.')) {
            window.localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Failed to clear supabase localStorage items.', e);
      }
    }

    // フォールバック:
    // サーバ側に残る httpOnly クッキーを確実に破棄するため、
    // Supabase の /auth/v1/logout にリダイレクトする（redirect_to に戻り先を指定）
    // 環境変数または import.meta.env から supabase URL を取得する
    try {
      let supabaseUrl = '';
      if (typeof process !== 'undefined' && process?.env?.REACT_APP_SUPABASE_URL) {
        supabaseUrl = String(process.env.REACT_APP_SUPABASE_URL);
      } else if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
        const metaEnv = (import.meta as any).env;
        supabaseUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.REACT_APP_SUPABASE_URL || metaEnv.SUPABASE_URL || '';
      } else {
        // 予備: supabase クライアント内部に URL が存在する可能性があるためいくつかの候補を試す
        // ただしライブラリの内部構造に依存するのは脆弱なので、可能なら
        // src/lib/supabaseClient.ts で supabaseUrl をエクスポートしてそれを import する方が確実です。
        const supabaseAny = supabase as any;
        if (supabaseAny?.supabaseUrl) {
          supabaseUrl = supabaseAny.supabaseUrl;
        } else if (supabaseAny?.url) {
          supabaseUrl = supabaseAny.url;
        } else if (supabaseAny?._supabaseUrl) {
          supabaseUrl = supabaseAny._supabaseUrl;
        } else {
          supabaseUrl = '';
        }
      }

      supabaseUrl = supabaseUrl.replace(/\/$/, '');

      if (supabaseUrl && typeof window !== 'undefined') {
        const redirectTo = window.location.origin || `${window.location.protocol}//${window.location.host}`;
        const logoutUrl = `${supabaseUrl}/auth/v1/logout?redirect_to=${encodeURIComponent(redirectTo)}`;
        console.info('[authUtils] redirecting to Supabase logout endpoint:', logoutUrl);
        // 強制的にブラウザを遷移させ、サーバ側クッキーを破棄してから戻す
        window.location.href = logoutUrl;
        return; // リダイレクトするのでここで終了
      }
    } catch (e) {
      console.warn('Failed to perform supabase logout redirect fallback:', e);
    }
    // フォールバックが行えない場合は何もしない（呼び出し側でナビゲート処理を行う）
  }
};
