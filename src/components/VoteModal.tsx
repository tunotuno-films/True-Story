import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Artist {
  id: string;
  name: string;
  points?: number;
  image_url?: string;
  role?: string;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: (voteSubmitted: boolean) => void;
  artists: Artist[];
  onShowPrivacyPolicy: () => void;
}

const VoteModal: React.FC<VoteModalProps> = ({ isOpen, onClose, artists, onShowPrivacyPolicy }) => {
  // すべてのHooksをearly returnより前に配置
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');
  const [hasAlreadyVotedToday, setHasAlreadyVotedToday] = useState<boolean>(false);
  const [step, setStep] = useState<'artist-selection' | 'phone-input' | 'otp'>('artist-selection');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [voterName, setVoterName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isOpen) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // 登録済みユーザーの電話番号を取得
        const { data: member } = await supabase
          .from('individual_members')
          .select('phone_number')
          .eq('auth_user_id', session.user.id)
          .single();
          
        if (member?.phone_number) {
          setUserPhoneNumber(member.phone_number);
          setPhoneNumber(member.phone_number);
        }
      }
    };

    checkUserStatus();
  }, [isOpen]);

  // 今日の投票状況をチェック
  useEffect(() => {
    const checkTodaysVote = async () => {
      if (!isOpen) return;
      
      if (currentUser) {
        // ログインユーザーの場合（任意のアーティストへの投票をチェック）
        const { data, error } = await supabase
          .rpc('check_user_todays_vote', {
            p_user_id: currentUser.id,
            p_artist_id: selectedArtistId || '00000000-0000-0000-0000-000000000000' // ダミーID
          });
          
        if (!error) {
          setHasAlreadyVotedToday(data);
        }
      } else if (phoneNumber) {
        // 未ログインユーザーの場合（任意のアーティストへの投票をチェック）
        const { data, error } = await supabase
          .rpc('check_todays_vote', {
            p_phone_number: phoneNumber,
            p_artist_id: selectedArtistId || '00000000-0000-0000-0000-000000000000' // ダミーID
          });
          
        if (!error) {
          setHasAlreadyVotedToday(data);
        }
      }
    };

    checkTodaysVote();
  }, [isOpen, phoneNumber, currentUser]); // selectedArtistIdを依存配列から除去

  // isOpenがfalseの場合はearly returnをHooksの後に配置
  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setStep('artist-selection');
    setSelectedArtistId('');
    setPhoneNumber('');
    setOtp('');
    setVoterName('');
    setMessage('');
    setIsSubmitting(false);
    setShowSuccessMessage(false);
    setErrorMessage('');
  };

  const handleClose = () => {
    onClose(showSuccessMessage);
    resetForm();
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\+?[0-9]*$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const formatPhoneNumber = (number: string): string => {
    if (number.startsWith('0')) {
      // '0'で始まる場合、日本の国コード'+81'を付けて先頭の'0'を削除
      return `+81${number.substring(1)}`;
    }
    return number;
  };

  const handleVote = async () => {
    if (!selectedArtistId || (!phoneNumber && !currentUser)) return;

    // 今日既に投票済みかチェック
    if (hasAlreadyVotedToday) {
      setErrorMessage('本日はすでに投票済みです。1日1回のみ投票可能です。');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const votePhoneNumber = phoneNumber || userPhoneNumber;
      
      // 登録済みユーザーで電話番号認証をスキップする場合
      const shouldSkipVerification = currentUser && userPhoneNumber;

      if (shouldSkipVerification) {
        // 直接投票を記録
        await recordVote(votePhoneNumber);
      } else {
        // 電話番号認証を開始
        await sendVerificationCode();
      }
    } catch (error) {
      console.error('Vote error:', error);
      setErrorMessage('投票中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber || !voterName) {
      setErrorMessage('電話番号とニックネームを入力してください');
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Supabase Auth でSMS認証を開始
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }

      setStep('otp');
    } catch (error) {
      console.error('SMS send error:', error);
      setErrorMessage('認証コードの送信に失敗しました');
    }
  };

  const handleSubmitVote = async () => {
    if (!otp) {
      setErrorMessage('認証コードを入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const formattedPhone = formatPhoneNumber(phoneNumber);

      // OTPを検証
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        throw error;
      }

      // 認証成功後に投票記録
      await recordVote(phoneNumber);
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrorMessage('認証コードが正しくありません');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordVote = async (votePhoneNumber: string) => {
    try {
      // 登録済みユーザーの場合、ニックネームとメッセージを取得
      let finalVoterName = voterName;
      let finalMessage = message;
      
      if (currentUser && userPhoneNumber) {
        // 登録済みユーザーの場合、individual_membersテーブルからニックネームを取得
        const { data: member } = await supabase
          .from('individual_members')
          .select('nickname')
          .eq('auth_user_id', currentUser.id)
          .single();
          
        finalVoterName = member?.nickname || 'ゲスト';
        finalMessage = message || ''; // メッセージは空でもOK
      }

      console.log('Recording vote with data:', {
        phone_number: votePhoneNumber,
        artist_id: selectedArtistId,
        voter_name: finalVoterName,
        message: finalMessage,
        user_id: currentUser?.id || null,
        voted_date: new Date().toISOString().split('T')[0]
      });

      // Step 1: 投票を記録
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert({
          phone_number: votePhoneNumber,
          artist_id: selectedArtistId,
          voter_name: finalVoterName,
          message: finalMessage,
          user_id: currentUser?.id || null,
          voted_date: new Date().toISOString().split('T')[0]
        })
        .select('id');

      if (voteError) {
        console.error('Vote insert error:', voteError);
        if (voteError.code === '23505') {
          setErrorMessage('本日はすでに投票済みです。1日1回のみ投票可能です。');
          return;
        }
        setErrorMessage(`投票の記録に失敗しました。エラーコード: ${voteError.code}`);
        return;
      }

      console.log('Vote recorded successfully:', voteData);

      // Step 2: アーティストにポイントを追加（最も確実なアプローチ）
      console.log('Adding points to artist:', selectedArtistId);
      
      // 直接SQLを使用してポイントを更新
      const { data: pointsUpdateResult, error: pointsError } = await supabase
        .rpc('add_artist_points', {
          artist_id_param: selectedArtistId,
          points_to_add: 10
        });

      if (pointsError) {
        console.error('RPC points addition error:', pointsError);
        
        // フォールバック1: 直接UPDATE
        try {
          const { data: currentData, error: fetchError } = await supabase
            .from('artists')
            .select('points')
            .eq('id', selectedArtistId)
            .single();

          if (!fetchError && currentData) {
            const currentPoints = currentData.points || 0;
            console.log('Fallback - Current points:', currentPoints);
            
            const { error: updateError } = await supabase
              .from('artists')
              .update({ points: currentPoints + 10 })
              .eq('id', selectedArtistId);

            if (updateError) {
              console.error('Fallback update error:', updateError);
            } else {
              console.log('Fallback update successful');
            }
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } else {
        console.log('RPC points addition successful, new total:', pointsUpdateResult);
      }

      // Step 3: 最終確認
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: finalArtist, error: checkError } = await supabase
        .from('artists')
        .select('points')
        .eq('id', selectedArtistId)
        .single();

      if (!checkError && finalArtist) {
        console.log('Final verification - artist points:', finalArtist.points);
      }

      // ログインユーザーの場合は投票履歴も記録
      if (currentUser) {
        const { error: historyError } = await supabase
          .from('user_vote_history')
          .insert({
            auth_user_id: currentUser.id,
            phone_number: votePhoneNumber,
            artist_id: selectedArtistId,
            voted_date: new Date().toISOString().split('T')[0]
          });

        if (historyError && historyError.code !== '23505') {
          console.error('History record error:', historyError);
        }
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Record vote error:', error);
      setErrorMessage('予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      onClose(true);
      resetForm();
    }, 300);
  };

  // 成功モーダル
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm mx-auto p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">投票完了！</h3>
          <p className="text-neutral-300 text-sm">
            投票が完了しました！<br />
            ありがとうございます。
          </p>
        </div>
        <button
          onClick={handleSuccessModalClose}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-md hover:opacity-90 transition duration-200"
        >
          OK
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white">投票</h2>
            <button onClick={handleClose} className="text-neutral-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === 'artist-selection' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">アーティストを選択してください</h2>
              <div className="space-y-3">
                {artists.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => {
                      setSelectedArtistId(artist.id);
                      setStep('phone-input');
                    }}
                    className="w-full p-4 text-left bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 hover:border-neutral-600 transition duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={artist.image_url}
                        alt={artist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-white">{artist.name}</h3>
                        <p className="text-sm text-neutral-400">{artist.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'phone-input' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {currentUser && userPhoneNumber ? '投票確認' : '電話番号認証'}
              </h2>
              
              {hasAlreadyVotedToday ? (
                <div className="mb-4 p-4 bg-yellow-900 border border-yellow-700 rounded-md">
                  <p className="text-yellow-300">本日はすでに投票済みです。1日1回のみ投票可能です。</p>
                </div>
              ) : currentUser && userPhoneNumber ? (
                <div className="mb-4">
                  <p className="text-neutral-300 mb-4">
                    登録済みの電話番号で投票します：{userPhoneNumber}
                  </p>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
                      応援メッセージ（任意）
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="HPにて公開されます。"
                      rows={3}
                      className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {errorMessage && <p className="text-red-400 text-center mb-4">{errorMessage}</p>}
                  <button
                    onClick={handleVote}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-md hover:opacity-90 transition duration-200 disabled:opacity-50"
                  >
                    {isLoading ? '投票中...' : '投票する'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="09012345678"
                      className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                      ニックネーム (公開されます)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder="例: しゅーと"
                      className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-8">
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
                      応援メッセージ
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="HPにて公開されます。"
                      rows={3}
                      className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {errorMessage && <p className="text-red-400 text-center mb-4">{errorMessage}</p>}

                  <div className="text-center text-xs text-neutral-400 mb-4">
                    <p>
                      「認証コードを送信」ボタンを押すことにより、
                      <button type="button" onClick={onShowPrivacyPolicy} className="text-blue-400 hover:underline">個人情報の取り扱い</button>
                      について同意したものとみなします。
                    </p>
                  </div>

                  <button
                    onClick={handleVote}
                    disabled={isLoading || !phoneNumber || !voterName}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50"
                  >
                    {isLoading ? '送信中...' : '認証コードを送信'}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 'otp' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">認証コードを入力</h2>
              <p className="text-sm text-neutral-400 mb-4">
                SMSに届いた6桁の認証コードを入力してください。
              </p>
              <div className="mb-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {errorMessage && <p className="text-red-400 text-center mb-4">{errorMessage}</p>}
              <button
                onClick={handleSubmitVote}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50"
              >
                {isSubmitting ? '投票中...' : 'この内容で投票する'}
              </button>
            </div>
          )}

          <div className="p-4 border-t border-neutral-700">
            <button
              onClick={handleClose}
              className="w-full text-center text-sm text-neutral-400 hover:text-white"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
      
      {/* 成功モーダルを別レイヤーで表示 */}
      {showSuccessModal && <SuccessModal />}
    </>,
    document.body
  );
};

export default VoteModal;