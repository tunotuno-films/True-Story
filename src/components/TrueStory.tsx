import React, { useState, useEffect } from 'react';

const TrueStory: React.FC = () => {
  const [story, setStory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const maxLength = 2000;
  const localStorageKey = 'trueStoryDraft';

  // 正しいTrueStoryフォームの情報
  const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScNvtbhGpynHbYUfvGvLHLo2MKSxsBLYDkNewyHHGDD3X7zPg/formResponse';
  const STORY_INPUT_NAME = 'entry.925362011'; // TrueStoryフォームのエントリーID

  // コンポーネント読み込み時にlocalStorageから下書きを復元
  useEffect(() => {
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
      setStory(savedDraft);
    }
  }, []);

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    if (newStory.length <= maxLength) {
      setStory(newStory);
      // 入力内容をlocalStorageに保存
      localStorage.setItem(localStorageKey, newStory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      setErrorMessage('フォームを入力してください。');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // 3秒後に自動で非表示
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setShowError(false);

    const formData = new FormData();
    formData.append(STORY_INPUT_NAME, story);

    fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // CORSエラーを回避
    })
    .then(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setStory('');
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

  return (
    <section id="truestory" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          TRUE STORY
        </h2>
        <p className="font-noto text-lg text-center text-neutral-300 mb-12">
          あなたの「実話の物語」を教えてください。
        </p>

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
          <form onSubmit={handleSubmit}>
            <textarea
              value={story}
              onChange={handleStoryChange}
              placeholder="ここにあなたの物語を記入してください..."
              rows={10}
              className={`w-full p-4 bg-neutral-800 text-white rounded-md border transition-colors text-lg ${
                showError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
              }`}
            />
            <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
              {story.length} / {maxLength}
            </div>
            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50"
              >
                {isSubmitting ? '送信中...' : 'この物語を投稿する'}
              </button>
            </div>
          </form>
        )}
        <div className="text-center text-xs text-neutral-500 mt-4">
          <p>※投稿された物語は、運営が内容を確認した後、サイトや関連メディアで紹介させていただく場合があります。</p>
          <p>個人を特定できる情報は含めないようご注意ください。</p>
          <p>入力内容はブラウザに自動で一時保存されます。ページを更新したり、後で書き直す場合も安心です。</p>
        </div>
      </div>
    </section>
  );
};

export default TrueStory;