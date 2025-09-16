import React from 'react';

interface Props {
  exampleStory: string;
  story: string;
  setStory: (s: string) => void;
  storyTextareaRef: React.RefObject<HTMLTextAreaElement>;
  hasViewedGuidelines: boolean;
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
  hasViewedGuidelines,
  insertExampleToForm,
  handleStoryChange,
  handleSubmit,
  isSubmitting,
  showError
}) => {
  return (
    <>
      <div className="mb-8 max-w-3xl mx-auto">
        <h4 className="text-left text-sm text-neutral-300 mb-2 font-semibold">書き方の例</h4>
        <div className="relative">
          <textarea
            value={exampleStory}
            readOnly
            rows={22}
            className={`w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500 text-sm min-h-[420px] ${ showError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : '' }`}
          />
        </div>
        <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
          {exampleStory.length}文字
        </div>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={insertExampleToForm}
            disabled={!hasViewedGuidelines}
            className={`bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg ${ !hasViewedGuidelines ? 'opacity-50 cursor-not-allowed' : '' }`}
          >
            この例文を元に書く
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={storyTextareaRef}
            value={story}
            onChange={handleStoryChange}
            placeholder="ここにあなたの物語を記入してください..."
            rows={20}
            disabled={!hasViewedGuidelines}
            className={`w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${ showError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : '' }`}
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
            この物語を送信する
          </button>
        </div>
      </form>
    </>
  );
};

export default StoryForm;
