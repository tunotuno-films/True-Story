import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  story: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  story,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-lg relative mx-4 border border-neutral-700">
        <button
          className="absolute top-3 right-3 text-neutral-400 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
        <div className="my-6">
            <p className="text-neutral-300 mb-4">以下の内容で物語を送信します。よろしいですか？</p>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-neutral-200 whitespace-pre-wrap">{story}</p>
            </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            type="button"
            className="py-2 px-6 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="py-2 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-md hover:opacity-90 transition-opacity"
          >
            送信する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
