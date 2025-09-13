import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import AuthForm from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string, name?: string) => void;
  initialMode: 'signin' | 'signup';
  setMode: (mode: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  initialMode
}) => {
  useEffect(() => {
    // ESCキーでモーダルを閉じられるようにする
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleAuthSuccess = (email: string, name?: string) => {
    onAuthSuccess(email, name);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4 overflow-hidden">
        <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={24} />
          </button>
          <div className="p-6">
            <AuthForm onAuthSuccess={handleAuthSuccess} initialMode={initialMode} />
          </div>
        </div>
      </div>
    ),
    document.body
  );
};

export default AuthModal;