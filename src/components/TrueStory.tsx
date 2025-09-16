import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import IndividualAuthForm from './IndividualAuthForm';
import GoogleAuthForm from './GoogleAuthForm';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StoryForm from './StoryForm';
import SubmissionSuccess from './SubmissionSuccess';
import GuidelinesModal from './GuidelinesModal';

interface TrueStoryProps {}

const TrueStory: React.FC<TrueStoryProps> = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasViewedGuidelines, setHasViewedGuidelines] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [storyToSubmit, setStoryToSubmit] = useState<string | null>(null);
  const prevSession = useRef(session);

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

  // 投稿テンプレ（X向け）
  const tweetTemplate = `True Story【実話の物語】の実話募集中！
皆さんの実話が映像作品になるかも！？
以下のURLから参加しよう！
https://www.truestory.jp/
#truestory #実話の物語 #実話募集`;

  useEffect(() => {
    // ログイン状態が変化したことを検知
    if (!prevSession.current && session && storyToSubmit) {
      submitStory(storyToSubmit, session.user);
      setStoryToSubmit(null);
      
      // ログイン後にスクロール
      setTimeout(() => {
        const section = document.getElementById('truestory');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    // 現在のセッションを保存
    prevSession.current = session;
  }, [session, storyToSubmit]);

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
    if (!hasViewedGuidelines) return;
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

  const submitStory = async (storyText: string, user: any) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setShowError(false);

    try {
      const storyBlob = new Blob([storyText], { type: 'text/plain' });
      const jstDate = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' });
      const timestamp = jstDate.replace(/ /g, 'T').replace(/:/g, '-');
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

    if (!session) {
      setStoryToSubmit(story);
      navigate('/users?redirect=home');
      return;
    }
    
    submitStory(story, session.user);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
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

        {/* 募集テーマの表示（シンプル：プレーン数字＋下線区切り） */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4 md:p-6">
            <h4 className="text-lg md:text-xl font-semibold text-white text-center mb-4">
              今回募集するテーマは5つ！
            </h4>

            <div className="divide-y divide-neutral-700">
              <div className="py-3 flex items-center gap-4">
                <div className="w-6 text-center text-white font-bold">1</div>
                <div className="text-neutral-200">学生時代の葛藤と成長</div>
              </div>

              <div className="py-3 flex items-center gap-4">
                <div className="w-6 text-center text-white font-bold">2</div>
                <div className="text-neutral-200">恋愛や友情の転機</div>
              </div>

              <div className="py-3 flex items-center gap-4">
                <div className="w-6 text-center text-white font-bold">3</div>
                <div className="text-neutral-200">家族との絆のすれ違い</div>
              </div>

              <div className="py-3 flex items-center gap-4">
                <div className="w-6 text-center text-white font-bold">4</div>
                <div className="text-neutral-200">デジタル社会での葛藤</div>
              </div>

              <div className="py-3 flex items-center gap-4">
                <div className="w-6 text-center text-white font-bold">5</div>
                <div className="text-neutral-200">夢と挫折、挑戦と成長</div>
              </div>
            </div>

            <p className="text-neutral-400 text-sm text-center mt-4">
              この5つのテーマから募集を行い、最終的に1つの物語を映像作品にします！
            </p>
          </div>
        </div>

        <div className="mb-8 text-center mt-8">
          <button
            type="button"
            onClick={() => setShowGuidelinesModal(true)}
            className={`${ hasViewedGuidelines ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500' } text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg`}
          >
            募集要項（PDF）を確認する
          </button>
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
            hasViewedGuidelines={hasViewedGuidelines}
            insertExampleToForm={insertExampleToForm}
            handleStoryChange={handleStoryChange}
            handleSubmit={handleMainSubmit}
            isSubmitting={isSubmitting}
            showError={showError}
          />
        )}

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md relative mx-4">
              <button
                className="absolute top-2 right-2 text-neutral-400 hover:text-white text-xl"
                onClick={() => setShowAuthModal(false)}
                type="button"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-white mb-6 text-center">ログインまたは新規登録</h3>
              <GoogleAuthForm onAuthSuccess={handleAuthSuccess} />
              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-neutral-600"></div>
                <span className="flex-shrink mx-4 text-neutral-400 text-sm">または</span>
                <div className="flex-grow border-t border-neutral-600"></div>
              </div>
              <IndividualAuthForm onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        )}

        {/* PDFモーダル（切り出し） */}
        <GuidelinesModal
          open={showGuidelinesModal}
          onClose={() => setShowGuidelinesModal(false)}
          setHasViewedGuidelines={setHasViewedGuidelines}
          hasViewedGuidelines={hasViewedGuidelines}
        />

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