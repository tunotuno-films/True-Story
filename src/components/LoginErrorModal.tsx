import React from 'react';
import { XCircle } from 'lucide-react';

type LoginErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onConfirm?: () => void;
};

const LoginErrorModal: React.FC<LoginErrorModalProps> = ({ isOpen, onClose, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-8 max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <XCircle size={24} />
        </button>
        
        <div className="text-center">
          <div className="mb-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">
            ログインエラー
          </h2>
          <p className="text-neutral-300 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            <button
              onClick={onConfirm || onClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginErrorModal;
