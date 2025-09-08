import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TrueStoryProps {
  onShowPrivacyPolicy: () => void;
}

const TrueStory: React.FC<TrueStoryProps> = ({ onShowPrivacyPolicy }) => {
  const [story, setStory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);

  // フォーム追加分
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [hasViewedGuidelines, setHasViewedGuidelines] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  const localStorageKey = 'trueStoryDraft';

  // エラー表示のヘルパー
  const showErrorWithTimeout = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  // GoogleフォームのID
  const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScNvtbhGpynHbYUfvGvLHLo2MKSxsBLYDkNewyHHGDD3X7zPg/formResponse';
  const STORY_INPUT_NAME = 'entry.925362011';
  const NICKNAME_INPUT_NAME = 'entry.1575117270';
  const EMAIL_INPUT_NAME = 'entry.531865602';
  const AGE_INPUT_NAME = 'entry.2092460043';
  const GENDER_INPUT_NAME = 'entry.839304455';
  const PARENTAL_CONSENT_INPUT_NAME = 'entry.2093339698';

  // コンポーネント読み込み時にlocalStorageから下書きを復元
  useEffect(() => {
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
      setStory(savedDraft);
    }
  }, []);

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    // 2000文字で入力を止めない。カウントのみ表示するため常に更新・保存
    setStory(newStory);
    localStorage.setItem(localStorageKey, newStory);
  };

  // スクロールイベントのdebounce用
  const scrollDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  // 募集要項PDFのスクロール末尾を検知（debounce付き）
  const handleGuidelinesScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
    }
    const el = e.currentTarget; // イベント内で参照を退避
    scrollDebounceRef.current = window.setTimeout(() => {
      if (!hasViewedGuidelines && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        setHasViewedGuidelines(true);
      }
    }, 100);
  }, [hasViewedGuidelines]);

  // メイン送信ボタン押下時
  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      showErrorWithTimeout('フォームを入力してください。');
      return;
    }
    setShowFormModal(true);
  };

  // モーダルフォーム送信
  const handleFormModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // メールアドレス型チェック
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nickname.trim() || !email.trim() || !age || !gender) {
      showErrorWithTimeout('すべての項目を入力してください。');
      return;
    }
    if (age === '10代' && !parentalConsent) {
      showErrorWithTimeout('10代の方は親の同意が必要です。');
      return;
    }
    if (!emailPattern.test(email)) {
      showErrorWithTimeout('正しいメールアドレスを入力してください。');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setShowError(false);

    const formData = new FormData();
    formData.append(STORY_INPUT_NAME, story);
    formData.append(NICKNAME_INPUT_NAME, nickname);
    formData.append(EMAIL_INPUT_NAME, email);
    formData.append(AGE_INPUT_NAME, age);
    formData.append(GENDER_INPUT_NAME, gender);

    // 親の同意チェックボックスがチェックされていれば送信（選択肢の文言と一致させる）
    if (parentalConsent) {
      formData.append(PARENTAL_CONSENT_INPUT_NAME, '親の同意を得ています');
    }

    fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // CORSエラーを回避
    })
      .then(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setStory('');
        setNickname('');
        setEmail('');
        setAge('');
        setGender('');
        setParentalConsent(false);
        setShowFormModal(false);
        // 送信成功後、localStorageから下書きを削除
        localStorage.removeItem(localStorageKey);
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        setErrorMessage('送信中にエラーが発生しました。');
        setShowError(true);
        setIsSubmitting(false);
      });
  };

  // プライバシーポリシー表示用の関数（propsから必ず受け取る）

  return (
    <section id="truestory" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          TRUE STORY
        </h2>
        <p className="font-noto text-lg text-center text-neutral-300 mb-12">
          あなたの「実話の物語」を教えてください。
        </p>

        {/* 募集要項（PDF）確認ボタン＋確認状況 */}
        <div className="mb-8 text-center -mt-6">
          <button
            type="button"
            onClick={() => setShowGuidelinesModal(true)}
            className={`${
              hasViewedGuidelines
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            } text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg`}
          >
            募集要項（PDF）を確認する
          </button>
          {/* 確認状況表示はフォーム中央へ移動のため削除 */}
        </div>

        {/* カスタムエラーメッセージ */}
        {showError && (
          <div className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center bg-emerald-900/50 border border-emerald-700 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">送信ありがとうございます！</h3>
            <p>あなたの物語が、誰かの心を動かすかもしれません。</p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              もう一度送信する
            </button>
          </div>
        ) : (
          <form onSubmit={handleMainSubmit}>
            {/* スクロール未確認時の注意喚起 */}
            {!hasViewedGuidelines && (
              <div className="mb-3 text-center text-sm text-neutral-400">
                募集要項を最後まで確認すると入力できます。
              </div>
            )}
            <div className="relative">
              <textarea
                value={story}
                onChange={handleStoryChange}
                placeholder="ここにあなたの物語を記入してください..."
                rows={10}
                disabled={!hasViewedGuidelines}
                className={`w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  showError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : ''
                }`}
              />
              {!hasViewedGuidelines && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-red-400 text-sm font-semibold">
                    募集要項（PDF）を確認すると入力できます
                  </span>
                </div>
              )}
            </div>
            <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
              {story.length}文字
            </div>
            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting || !hasViewedGuidelines}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showFormModal ? '追加情報を入力してください' : 'この物語を送信する'}
              </button>
            </div>
          </form>
        )}

        {/* ポップアップフォーム */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md relative mx-4">
              <button
                className="absolute top-2 right-2 text-neutral-400 hover:text-white text-xl"
                onClick={() => setShowFormModal(false)}
                type="button"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4 text-white">追加情報を入力してください</h3>
              <form onSubmit={handleFormModalSubmit}>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-300 mb-1">ニックネーム</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-300 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-300 mb-1">年代</label>
                  <select
                    value={age}
                    onChange={e => {
                      setAge(e.target.value);
                      // 10代以外を選択した場合は親の同意をリセット
                      if (e.target.value !== '10代') {
                        setParentalConsent(false);
                      }
                    }}
                    className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="10代">10代</option>
                    <option value="20代">20代</option>
                    <option value="30代">30代</option>
                    <option value="40代">40代</option>
                    <option value="50代">50代</option>
                    <option value="60代">60代</option>
                    <option value="70代">70代</option>
                    <option value="80代">80代</option>
                    <option value="90代">90代</option>
                  </select>
                </div>

                {/* 10代選択時のみ親の同意確認を表示 */}
                {age === '10代' && (
                  <div className="mb-4">
                    <label className="flex items-center text-sm text-neutral-300 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={parentalConsent}
                          onChange={e => setParentalConsent(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          parentalConsent 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'bg-neutral-800 border-neutral-600 group-hover:border-neutral-500'
                        }`}>
                          {parentalConsent && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 group-hover:text-neutral-200 transition-colors">
                        親の同意を得ています
                      </span>
                    </label>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm text-neutral-300 mb-1">性別</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="選択しない">選択しない</option>
                  </select>
                </div>
                <div className="text-center text-xs text-neutral-400 mb-4">
                  <p>
                    「送信する」ボタンを押すことにより、
                    <button
                      type="button"
                      onClick={onShowPrivacyPolicy}
                      className="text-cyan-400 hover:underline"
                    >
                      個人情報の取り扱い
                    </button>
                    について同意したものとみなします。
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50"
                >
                  送信する
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PDFモーダル */}
        {showGuidelinesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-5xl h-[85vh] relative mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
                <h3 className="text-white font-semibold">募集要項（PDF）</h3>
                <button
                  className="text-neutral-400 hover:text-white text-xl"
                  onClick={() => setShowGuidelinesModal(false)}
                  type="button"
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>
              <div
                className="h-full overflow-y-auto bg-neutral-800/30"
                onScroll={handleGuidelinesScroll}
              >
                <object
                  data="/pdf/20250824_TrueStory_ApplicationGuidelines.pdf#view=FitH"
                  type="application/pdf"
                  className="w-full min-h-[1400px]"
                >
                  <iframe
                    src="/pdf/20250824_TrueStory_ApplicationGuidelines.pdf#view=FitH"
                    className="w-full min-h-[1400px]"
                    title="募集要項PDF"
                  />
                  <p className="p-4 text-neutral-300 text-sm">
                    PDFを表示できない場合は{" "}
                    <a
                      href="/pdf/20250824_TrueStory_ApplicationGuidelines.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      こちら
                    </a>
                    を開いてください。
                  </p>
                </object>
              </div>
              <div className="px-4 py-2 border-t border-neutral-700 text-xs text-neutral-400">
                最後までスクロールすると確認済みになります。
              </div>

              {/* スクロール完了時のみ表示するフローティング閉じるボタン */}
              {hasViewedGuidelines && (
                <button
                  type="button"
                  onClick={() => setShowGuidelinesModal(false)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30 transition"
                >
                  PDFを閉じる
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-neutral-500 mt-4">
          <p>※投稿された物語は、運営が内容を確認した後、サイトや関連メディアで紹介させていただく場合があります。</p>
          <p>個人を特定できる情報は含めないようご注意ください。</p>
          <p>入力内容はブラウザに自動で一時保存されます。ページを更新したり、後で書き直すことも可能です。</p>
        </div>
      </div>
    </section>
  );
};

export default TrueStory;