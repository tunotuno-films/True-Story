import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Artist {
  id: string;
  name: string;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: (voteSubmitted: boolean) => void;
  artists: Artist[];
  onShowPrivacyPolicy: () => void;
}

const VoteModal: React.FC<VoteModalProps> = ({ isOpen, onClose, artists, onShowPrivacyPolicy }) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [voterName, setVoterName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setStep('form');
    setSelectedArtist('');
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

  const handleSendOtp = async () => {
    setErrorMessage('');
    if (!selectedArtist) {
      setErrorMessage('アーティストを選択してください。');
      return;
    }
    if (!voterName.trim()) {
      setErrorMessage('お名前を入力してください。');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    if (!formattedPhoneNumber.match(/^\+81[789]0\d{8}$/) && !formattedPhoneNumber.match(/^\+81\d{9}$/)) {
      setErrorMessage('有効な日本の携帯電話番号を入力してください。(例: 09012345678)');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhoneNumber,
    });

    if (error) {
      setErrorMessage(`エラー: ${error.message}`);
      setIsSubmitting(false);
    } else {
      setStep('otp');
      setIsSubmitting(false);
    }
  };

  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otp.match(/^[0-9]{6}$/)) {
      setErrorMessage('6桁の認証コードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      // 1. OTPを検証
      const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhoneNumber,
        token: otp,
        type: 'sms',
      });

      if (verifyError) throw verifyError;
      if (!session?.user) throw new Error('認証に失敗しました。');

      // 2. 投票をデータベースに挿入
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ 
          artist_id: selectedArtist, 
          voter_name: voterName,
          message: message,
          user_id: session.user.id,
        }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setErrorMessage('この電話番号は既に投票済みです。');
          setStep('form'); // フォームに戻す
        } else {
          throw insertError;
        }
      } else {
        setShowSuccessMessage(true);
      }
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      setErrorMessage(`エラーが発生しました: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-neutral-800 text-white p-8 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-noto">{showSuccessMessage ? '投票完了' : '投票フォーム'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        {showSuccessMessage ? (
          <div className="text-center">
            <p className="text-lg mb-6">投票が完了しました！<br />ご協力ありがとうございます。</p>
            <button onClick={handleClose} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg">閉じる</button>
          </div>
        ) : (
          <form onSubmit={step === 'otp' ? handleSubmitVote : (e) => e.preventDefault()}>
            <fieldset disabled={step === 'otp'}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 font-noto">アーティストを選択 <span className="text-red-500">*</span></h3>
                <div className="space-y-2">
                  {artists.map((artist) => (
                    <label key={artist.id} className="flex items-center p-3 bg-neutral-700 rounded-md cursor-pointer hover:bg-neutral-600 transition-colors">
                      <input type="radio" name="artist" value={artist.id} checked={selectedArtist === artist.id} onChange={(e) => setSelectedArtist(e.target.value)} className="form-radio h-5 w-5 text-purple-500 bg-neutral-900 border-neutral-600 focus:ring-purple-500" />
                      <span className="ml-4 text-lg">{artist.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="name" className="block text-lg font-semibold mb-3 font-noto">ニックネーム (公開されます) <span className="text-red-500">*</span></label>
                <input type="text" id="name" value={voterName} onChange={(e) => setVoterName(e.target.value)} placeholder="例: しゅーと" className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="mb-8">
                <label htmlFor="message" className="block text-lg font-semibold mb-3 font-noto">応援メッセージ</label>
                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="HPにて公開されます。" rows={3} className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </fieldset>

            {step === 'form' && (
              <div className="mb-6">
                <label htmlFor="phone" className="block text-lg font-semibold mb-3 font-noto">電話番号 (SMS認証) <span className="text-red-500">*</span></label>
                <input type="tel" id="phone" value={phoneNumber} onChange={handlePhoneNumberChange} placeholder="例: 09012345678" className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
            )}

            {step === 'otp' && (
              <div className="mb-8">
                <label htmlFor="otp" className="block text-lg font-semibold mb-3 font-noto">認証コード <span className="text-red-500">*</span></label>
                <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="SMSに届いた6桁のコード" className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
            )}

            {errorMessage && <p className="text-red-400 text-center mb-4">{errorMessage}</p>}

            <div className="text-center text-xs text-neutral-400 mb-4">
              <p>
                「認証コードを送信」ボタンを押すことにより、
                <button type="button" onClick={onShowPrivacyPolicy} className="text-cyan-400 hover:underline">個人情報の取り扱い</button>
                について同意したものとみなします。
              </p>
            </div>

            {step === 'form' ? (
              <button type="button" onClick={handleSendOtp} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? '送信中...' : '認証コードを送信'}
              </button>
            ) : (
              <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? '投票中...' : 'この内容で投票する'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default VoteModal;
