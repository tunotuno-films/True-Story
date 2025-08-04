import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

interface NewsItem {
  id: string;
  published_date: string;
  title: string;
  content: string;
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItem: NewsItem | null;
}

const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, newsItem }) => {
  if (!newsItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
              <p className="text-sm text-neutral-400 mb-2">{new Date(newsItem.published_date).toLocaleDateString()}</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">{newsItem.title}</h3>
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown>{newsItem.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsModal;
