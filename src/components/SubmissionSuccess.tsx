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

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(tweetTemplate);
    } catch (e) {
      console.error('コピーに失敗しました', e);
    }
  };

  return (
    <div className="text-center bg-emerald-900/50 border border-emerald-700 text-white p-6 md:p-8 rounded-lg">
      <h3 className="text-2xl font-bold mb-3">送信ありがとうございます！</h3>
      <p className="text-neutral-200 mb-4">あなたの物語が、誰かの心を動かすかもしれません。</p>

      <div className="max-w-xl mx-auto text-left bg-neutral-800/40 border border-neutral-700 rounded-md p-4">
        <label className="text-sm text-neutral-400 mb-2 block">以下のテンプレートをXに投稿できます（編集可）</label>
        <textarea
          readOnly
          value={tweetTemplate}
          rows={6}
          className="w-full bg-neutral-900 text-neutral-100 p-3 rounded-md text-sm resize-none mb-3"
        />

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={postToX}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              X に投稿する
            </button>
            <button
              type="button"
              onClick={copyTemplate}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-md text-sm"
            >
              テンプレをコピー
            </button>
          </div>

          <button
            onClick={onRetry}
            className="mt-2 sm:mt-0 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm"
          >
            もう一度送信する
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
