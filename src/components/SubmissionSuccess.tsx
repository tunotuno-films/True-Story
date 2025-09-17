import React from 'react';

interface Props {
  tweetTemplate: string;
  onRetry: () => void;
}

const SubmissionSuccess: React.FC<Props> = ({ tweetTemplate, onRetry }) => {
  const postToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTemplate)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // A simple X logo SVG component
  const XLogo = () => (
    <svg viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="w-6 h-6" fill="currentColor">
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.828Z" />
    </svg>
  );

  return (
    <div className="bg-black text-white font-sans max-w-md mx-auto rounded-2xl border border-neutral-800 shadow-2xl shadow-blue-500/10 overflow-hidden my-8">
      <div className="p-4">
        <div className="flex items-start">
          {/* Profile Picture */}
          <img src="/img/logo.png" alt="True Story Logo" className="w-12 h-12 rounded-full mr-4" />

          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="font-bold">True Story</div>
              <XLogo />
            </div>
            <div className="text-neutral-500 text-sm">@TrueStoryApp</div>

            {/* Message */}
            <p className="mt-3 mb-4">
              投稿ありがとうございます！<br />
              物語を投稿したことを共有しよう。
            </p>

            {/* "Quoted Tweet" */}
            <div className="border border-neutral-700 rounded-xl p-3 mt-2">
              <p className="text-neutral-400 text-sm">↓ Xでシェアする内容</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {tweetTemplate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-neutral-800">
        <button
          onClick={onRetry}
          className="flex-1 text-center py-3 text-neutral-400 hover:bg-neutral-900 transition-colors duration-200"
        >
          もう一度書く
        </button>
        <div className="w-px bg-neutral-800"></div>
        <button
          onClick={postToX}
          className="flex-1 flex items-center justify-center gap-2 text-center py-3 font-bold text-blue-500 hover:bg-blue-500/10 transition-colors duration-200"
        >
          <XLogo />
          <span>Xでシェアする</span>
        </button>
      </div>
    </div>
  );
};

export default SubmissionSuccess;