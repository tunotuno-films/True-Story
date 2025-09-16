import React, { useCallback } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  setHasViewedGuidelines: (v: boolean) => void;
  hasViewedGuidelines: boolean;
}

const GuidelinesModal: React.FC<Props> = ({ open, onClose, setHasViewedGuidelines, hasViewedGuidelines }) => {
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!hasViewedGuidelines && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setHasViewedGuidelines(true);
    }
  }, [hasViewedGuidelines, setHasViewedGuidelines]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-5xl h-[85vh] relative mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <h3 className="text-white font-semibold">募集要項（PDF）</h3>
          <button
            className="text-neutral-400 hover:text-white text-xl"
            onClick={onClose}
            type="button"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <div className="h-full overflow-auto bg-neutral-800/30" onScroll={handleScroll}>
          <div className="w-full flex justify-center">
            <object
              data="/pdf/20250824_TrueStory_ApplicationGuidelines.pdf#view=FitH"
              type="application/pdf"
              className="min-w-[760px] w-full max-w-none min-h-[1400px]"
            >
              <iframe
                src="/pdf/20250824_TrueStory_ApplicationGuidelines.pdf#view=FitH"
                className="min-w-[760px] w-full max-w-none min-h-[1400px]"
                title="募集要項PDF"
              />
              <p className="p-4 text-neutral-300 text-sm">
                PDFを表示できない場合は <a
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
        </div>
        <div className="px-4 py-2 border-t border-neutral-700 text-xs text-neutral-400">
          最後までスクロールすると確認済みになります。
        </div>

        {hasViewedGuidelines && (
          <button
            type="button"
            onClick={onClose}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30 transition"
          >
            PDFを閉じる
          </button>
        )}
      </div>
    </div>
  );
};

export default GuidelinesModal;
