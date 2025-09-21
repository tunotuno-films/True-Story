import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdownDuration?: number;
}

const LoginRedirectModal: React.FC<LoginRedirectModalProps> = ({
  isOpen,
  onClose,
  countdownDuration = 5,
}) => {
  const [countdown, setCountdown] = useState(countdownDuration);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCountdown(countdownDuration);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, countdownDuration]);

  useEffect(() => {
    if (!isOpen) return;

    if (countdown <= 0) {
      navigate('/users/member');
      onClose();
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isOpen, countdown, navigate, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-neutral-700 transform transition-all duration-300 ease-in-out scale-95"
        style={{ transform: isVisible ? 'scale(1)' : 'scale(0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center mb-6">
          <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">ログインページへ移動します</h3>
        <div className="mb-6 text-neutral-300">
          <p>物語の送信まであと少しです。</p>
          <p>入力内容は保持されます。</p>
        </div>
        <div className="flex justify-center items-center text-neutral-400">
          <p>
            <span className="text-2xl font-bold text-emerald-500">{countdown}</span>
            秒後に自動で移動します...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirectModal;