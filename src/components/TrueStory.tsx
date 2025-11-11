import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import IndividualAuthForm from './IndividualAuthForm';
import GoogleAuthForm from './GoogleAuthForm';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StoryForm from './StoryForm';
import SubmissionSuccess from './SubmissionSuccess';
import ConfirmationModal from './ConfirmationModal';
import LoginRedirectModal from './LoginRedirectModal';
import WelcomeBackModal from './WelcomeBackModal';

interface TrueStoryProps {}

const TrueStory: React.FC<TrueStoryProps> = () => {
  const { session } = useAuth();
  const [story, setStory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [storyForModal, setStoryForModal] = useState('');
  const [showLoginRedirectModal, setShowLoginRedirectModal] = useState(false);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);

  const localStorageKey = 'trueStoryDraft';

  const exampleStory = `私は高知県の女子大に通う大学1年生です。
私には大学の友達には誰にも言えない秘密があります。
高校3年の時に体験したちょっと変わった恋愛体験です。
私には当時気になっていた同級生がいました。
でも、怖くて誰にも言えませんでした。
恋愛対象が女性だったからです。
友達は、サッカー部の○○君かっこいいとか、野球部の○○君かっこいいという話で盛り上がっていましたが、私は全くそんな感情がなく
ずっと目で追いかけていたのはクラスの女の子でした。
その子は3年の4月に、東京から引っ越してきた転校生でした。
「なんか、気になる。」
本当にこれだけでした。
元々、高校1年の時は他のクラスの同級生の男子とお付き合いしていたり、普通に青春を過ごしていました。
高校2年の時には、バスケ部の男子からの猛アタックもあったり...。
バスケ部の彼は学年でも優しくて評判の男子でした。
でも高校3年の4月を境に急に自分の恋愛観が変わりました。
正直あの時に体験は書ききれないし、うまく伝えきれません。
でも、ビビッときました。
そのまま特に何も変わらない日々が続き、
バスケ部の彼から屋上で告白されました。
すごく嬉しかったのですが、どうしても4月に感じたあの感覚が忘れられずに、気持ちには応えられないと断って、
転校生の子のところへ向かいました・・・`;

  const tweetTemplate = `True Story【実話の物語】の実話募集中！
皆さんの実話が映像作品になるかも！？
以下のURLから参加しよう！
https://www.truestory.jp/
#truestory #実話の物語 #実話募集`;

  // This effect handles showing the welcome back modal
  useEffect(() => {
    const shouldShowWelcomeBack = localStorage.getItem('showWelcomeBackModalAfterLogin') === 'true';
    if (shouldShowWelcomeBack && session) {
      console.log("TrueStory.tsx: WelcomeBackModalを表示中。");
      setShowWelcomeBackModal(true);
      localStorage.removeItem('showWelcomeBackModalAfterLogin');
    }
  }, [session]);

  // This effect handles showing the confirmation modal
  useEffect(() => {
    const shouldShowModalAfterLogin = localStorage.getItem('showConfirmModalAfterLogin') === 'true';
    if (shouldShowModalAfterLogin && session && story) {
      // We don't show it immediately, we wait for the welcome modal to close
      // This will be handled by the `handleWelcomeBackClose` function
    }
  }, [session, story]);

  const showErrorWithTimeout = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
      setStory(savedDraft);
    }
  }, []);

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    setStory(newStory);
    localStorage.setItem(localStorageKey, newStory);
  };

  const storyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertExampleToForm = () => {
    setStory(exampleStory);
    localStorage.setItem(localStorageKey, exampleStory);
    setIsSubmitted(false);
    setTimeout(() => {
      const el = storyTextareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    }, 0);
  };

  const submitStory = async (storyText: string, user: User) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setShowError(false);

    try {
      const storyBlob = new Blob([storyText], { type: 'text/plain' });
      const iso = new Date().toISOString();
      const timestamp = iso.replace(/:/g, '-');
      const fileName = `story-${timestamp}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(`public/${fileName}`, storyBlob);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('stories').insert([
        { user_id: user.id, file_path: `public/${fileName}` },
      ]);

      if (insertError) throw insertError;

      setIsSubmitting(false);
      setIsSubmitted(true);
      setStory('');
      localStorage.removeItem(localStorageKey);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error) {
        setErrorMessage(`送信中にエラーが発生しました: ${error.message}`);
      } else {
        setErrorMessage('送信中に不明なエラーが発生しました。');
      }
      setShowError(true);
      setIsSubmitting(false);
    }
  };

  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      showErrorWithTimeout('フォームを入力してください。');
      return;
    }

    setStoryForModal(story);

    if (!session) {
      localStorage.setItem('pendingStorySubmission', 'true');
      localStorage.setItem('showConfirmModalAfterLogin', 'true');
      localStorage.setItem('showWelcomeBackModalAfterLogin', 'true');
      if (hasAgreed) {
        localStorage.setItem('storyFormAgreed', 'true');
      }
      setShowLoginRedirectModal(true);
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (session) {
      submitStory(storyForModal, session.user);
    }
    setShowConfirmModal(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  // 5. Handle closing of welcome modal
  const handleWelcomeBackClose = () => {
    setShowWelcomeBackModal(false);
    const shouldShowConfirm = localStorage.getItem('showConfirmModalAfterLogin') === 'true';
    if (shouldShowConfirm && story) {
        setStoryForModal(story);
        setShowConfirmModal(true);
        localStorage.removeItem('showConfirmModalAfterLogin');
    }
  };

  return (
    <section className="py-20 md:py-32 bg-neutral-900" >
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          TRUE STORY
        </h2>
        <p className="font-noto text-lg text-center text-white mb-12">
          あなたの「実話の物語」を教えてください。
        </p>

        <div className="max-w-3xl mx-auto mb-8">
          <div
            className="border rounded-lg p-4 md:p-6"
            style={{ backgroundColor: '#315477',  }}
          >
            <div className="flex flex-col mb-4 relative">
              <h4 className="text-lg md:text-xl font-semibold text-white text-center py-4">
                今回募集するテーマ！
              </h4>
              <div className="mt-2 flex justify-center md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:mt-0">
                {/* 環境変数から読み込み。無ければ public 配下のフォールバック画像を使用し、警告を出す */}
                {(() => {
                  const QUO_CARD_IMAGE_URL = process.env.NEXT_PUBLIC_QUO_CARD_IMAGE_URL ?? '/img/st050011_quosmile_silver.jpg';
                  if (!process.env.NEXT_PUBLIC_QUO_CARD_IMAGE_URL) {
                    console.warn('NEXT_PUBLIC_QUO_CARD_IMAGE_URL is not set. Using fallback image.');
                  }
                  return (
                    <img
                      src={QUO_CARD_IMAGE_URL}
                      alt="QUOカード"
                      className="h-auto rounded-lg shadow-lg max-w-[80px] md:max-w-[100px]"
                    />
                  );
                })()}
              </div>
            </div>
            <p className="text-center text-white text-base mb-4">
              ご提供いただきました実話が採用された場合、謝礼として5,000円分のQUOカードを贈呈！
            </p>

            <div className="divide-y divide-neutral-700">
              <div className="py-3 flex items-center gap-4">
                <div className="text-white pl-6"> ・　恋愛・友情の物語</div>
              </div>
            </div>

            <p className="text-white text-xs text-center mt-2">
              ※ご応募いただく実話は、上記のテーマに沿った内容でお願いいたします。
            </p>
          </div>
        </div>

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
          <SubmissionSuccess tweetTemplate={tweetTemplate} onRetry={() => setIsSubmitted(false)} />
        ) : (
          <StoryForm
            exampleStory={exampleStory}
            story={story}
            setStory={setStory}
            storyTextareaRef={storyTextareaRef}
            insertExampleToForm={insertExampleToForm}
            handleStoryChange={handleStoryChange}
            handleSubmit={handleMainSubmit}
            isSubmitting={isSubmitting}
            showError={showError}
            hasAgreed={hasAgreed}
            setHasAgreed={setHasAgreed}
          />
        )}

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md relative mx-4">
              <button
                className="absolute top-2 right-2 text-white hover:text-white text-xl"
                onClick={() => setShowAuthModal(false)}
                type="button"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-white mb-6 text-center">ログインまたは新規登録</h3>
              <GoogleAuthForm onAuthSuccess={handleAuthSuccess} />
              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-neutral-600"></div>
                <span className="flex-shrink mx-4 text-white text-sm">または</span>
                <div className="flex-grow border-t border-neutral-600"></div>
              </div>
              <IndividualAuthForm onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        )}

        <div className="text-center text-xs text-white mt-4">
          <p>個人を特定できる情報は含めないようご注意ください。</p>
          <p>「この物語を送信する」ボタンを押すことにより、<a href="#privacy-policy" className="text-cyan-400 hover:underline">個人情報の取り扱い</a>について同意したものとみなします。</p>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="物語の送信確認"
        story={storyForModal}
      />
      <LoginRedirectModal
        isOpen={showLoginRedirectModal}
        onClose={() => setShowLoginRedirectModal(false)}
      />
      {/* 6. Add WelcomeBackModal to JSX */}
      <WelcomeBackModal
        isOpen={showWelcomeBackModal}
        onClose={handleWelcomeBackClose}
      />
    </section>
  );
};

export default TrueStory;
