import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (email: string, name?: string) => void;
  initialMode: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, initialMode }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your name for signup.');
      return;
    }
    onAuthSuccess(email, mode === 'signup' ? name : undefined);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
            placeholder="you@example.com"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
            placeholder="Password"
            type="password"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </form>
      <p className="text-sm text-gray-400 mt-3">
        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-blue-400 hover:underline"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
};

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