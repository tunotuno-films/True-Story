import React, { useState, useRef, useEffect } from 'react';
import applicationNotes from '../content/applicationNotes.json';

interface Props {
  exampleStory: string;
  story: string;
  setStory: (s: string) => void;
  storyTextareaRef: React.RefObject<HTMLTextAreaElement>;
  insertExampleToForm: () => void;
  handleStoryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  showError: boolean;
}

const StoryForm: React.FC<Props> = ({
  exampleStory,
  story,
  storyTextareaRef,
  insertExampleToForm,
  handleStoryChange,
  handleSubmit,
  isSubmitting,
  showError,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const noticeRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // スクロール位置が一番下に近いかどうかを判定 (少し余裕を持たせる)
    if (!canAgree && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setCanAgree(true);
    }
  };

  // ネイティブリスナーを passive: false で登録して preventDefault を許可する
  useEffect(() => {
    const el = noticeRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      const delta = (e as WheelEvent).deltaY;
      if ((delta > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight) ||
          (delta < 0 && el.scrollTop <= 0)) {
        e.preventDefault();
      }
    };

    const touchStartHandler = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const startY = touchStartY.current;
      if (startY === null) return;
      const currentY = e.touches[0]?.clientY ?? 0;
      const diff = startY - currentY; // 正：上スクロール、負：下スクロール
      if ((diff > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight) ||
          (diff < 0 && el.scrollTop <= 0)) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', wheelHandler, { passive: false });
    el.addEventListener('touchstart', touchStartHandler, { passive: true });
    el.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      el.removeEventListener('wheel', wheelHandler);
      el.removeEventListener('touchstart', touchStartHandler);
      el.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [noticeRef]);

  return (
    <>
      <div className="mb-8 max-w-7xl mx-auto">
        <h4 className="text-left text-xl text-white mb-3 font-bold">応募に関する注意事項</h4>
        <div
          ref={noticeRef}
          onScroll={handleScroll}
          className="h-64 overflow-y-auto bg-neutral-800/30 p-4 border border-neutral-700 rounded-lg text-neutral-300 text-sm space-y-4"
        >
          <p className="font-bold text-white">{applicationNotes.title}</p>
          {applicationNotes.sections.map((sec, idx) => (
            <div key={idx}>
              <h5 className="font-bold text-white">{sec.title}</h5>
              <div className="text-neutral-300" dangerouslySetInnerHTML={{ __html: sec.html }} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <input
            type="checkbox"
            id="agreement"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            disabled={!canAgree}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="agreement" className={`ml-2 block text-sm ${canAgree ? 'text-neutral-300' : 'text-neutral-500'}`}>
            応募に関する注意事項に同意します
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-screen-2xl mx-auto">
        <div className="mb-8 md:mb-0 flex flex-col">
          <h4 className="text-left text-xl text-white mb-3 font-bold">例文</h4>
          <div className="relative flex flex-col h-full">
            <div
              className={`w-full p-4 bg-neutral-900/50 border border-dashed border-neutral-600 rounded-lg text-neutral-300 text-sm max-h-[60vh] overflow-y-auto whitespace-pre-wrap`}
            >
              {exampleStory}
            </div>
            <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
              {exampleStory.length}文字
            </div>
            <div className="text-center mt-2 h-12 flex items-center justify-center">
              <span
                onClick={hasAgreed ? insertExampleToForm : undefined}
                role="button"
                aria-disabled={!hasAgreed}
                tabIndex={hasAgreed ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (hasAgreed) {
                      insertExampleToForm();
                    }
                  }
                }}
                className={`text-emerald-400 ${hasAgreed ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-sm font-semibold transition-opacity duration-200`}
              >
                この例文を元に書く
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <h4 className="text-left text-xl text-white mb-3 font-bold">応募フォーム</h4>
          <div className="relative flex-grow">
            <textarea
              ref={storyTextareaRef}
              value={story}
              onChange={handleStoryChange}
              placeholder="ここにあなたの物語を記入してください..."
              className={`w-full p-4 bg-neutral-900/50 border ${showError ? 'border-red-500' : 'border-dashed border-neutral-600'} rounded-lg text-neutral-300 text-lg min-h-[600px] resize-none`}
              disabled={!hasAgreed}
            />
            {!hasAgreed && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900/80 rounded-lg">
                <span className="text-red-400 text-sm font-semibold text-center px-4">
                  注意事項を確認し、同意すると入力できます
                </span>
              </div>
            )}
          </div>
          <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
            {story.length}文字
          </div>
          <div className="text-center mt-6 h-20 flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !hasAgreed}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              この物語を送信する
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StoryForm;