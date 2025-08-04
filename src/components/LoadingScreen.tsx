import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = performance.now();
      const duration = 2000; // 2秒間

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsedTime = timestamp - (startTimeRef.current ?? timestamp);
        const progress = Math.min(100, (elapsedTime / duration) * 100);

        setLoadingProgress(progress);

        if (progress < 100) {
          requestRef.current = requestAnimationFrame(animate);
        }
      };

      requestRef.current = requestAnimationFrame(animate);

      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
        >
          {/* グラデーション背景 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-black z-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          />

          {/* パーティクル効果 */}
          <div className="absolute inset-0 z-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: '#688EA5' }}
                initial={{
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                  opacity: Math.random() * 0.5 + 0.3,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: [null, Math.random() * -100 - 50],
                  opacity: [null, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>

          {/* メインコンテンツ */}
          <div className="relative z-20 flex flex-col items-center">
            {/* 映画制作アニメーション */}
            <div className="block w-[150px] h-auto text-purple-500">
              <svg width="150" height="150" viewBox="0 0 150 150">
                {/* デスクトップモニター画面 */}
                <motion.rect
                  x="15"
                  y="30"
                  width="120"
                  height="75"
                  rx="3"
                  stroke="#688EA5"
                  strokeWidth="2"
                  fill="rgba(40, 50, 60, 0.9)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />

                {/* モニター台座 */}
                <motion.rect
                  x="65"
                  y="105"
                  width="20"
                  height="10"
                  rx="2"
                  stroke="#688EA5"
                  strokeWidth="1"
                  fill="rgba(100, 100, 100, 0.8)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />

                {/* ベーススタンド */}
                <motion.rect
                  x="55"
                  y="115"
                  width="40"
                  height="4"
                  rx="2"
                  stroke="#688EA5"
                  strokeWidth="1"
                  fill="rgba(100, 100, 100, 0.8)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                />

                {/* タイムライン - Video 1トラック */}
                <motion.rect
                  x="20"
                  y="45"
                  width="50"
                  height="8"
                  rx="1"
                  fill="#10b981"
                  initial={{ width: 0 }}
                  animate={{ width: 50 }}
                  transition={{ delay: 0.8, duration: 1 }}
                />

                {/* タイムライン - Video 2トラック */}
                <motion.rect
                  x="20"
                  y="55"
                  width="30"
                  height="8"
                  rx="1"
                  fill="#688EA5"
                  initial={{ width: 0 }}
                  animate={{ width: 30 }}
                  transition={{ delay: 1, duration: 1 }}
                />

                <motion.rect
                  x="55"
                  y="55"
                  width="40"
                  height="8"
                  rx="1"
                  fill="#688EA5"
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 1.2, duration: 1 }}
                />

                {/* タイムライン - Audioトラック */}
                <motion.rect
                  x="20"
                  y="65"
                  width="25"
                  height="6"
                  rx="1"
                  fill="#16a34a"
                  initial={{ width: 0 }}
                  animate={{ width: 25 }}
                  transition={{ delay: 1.4, duration: 1 }}
                />

                <motion.rect
                  x="50"
                  y="65"
                  width="35"
                  height="6"
                  rx="1"
                  fill="#16a34a"
                  initial={{ width: 0 }}
                  animate={{ width: 35 }}
                  transition={{ delay: 1.6, duration: 1 }}
                />

                {/* タイムライン - Effectsトラック */}
                <motion.rect
                  x="25"
                  y="75"
                  width="20"
                  height="5"
                  rx="1"
                  fill="#059669"
                  initial={{ width: 0 }}
                  animate={{ width: 20 }}
                  transition={{ delay: 1.8, duration: 1 }}
                />

                <motion.rect
                  x="50"
                  y="75"
                  width="15"
                  height="5"
                  rx="1"
                  fill="#059669"
                  initial={{ width: 0 }}
                  animate={{ width: 15 }}
                  transition={{ delay: 2, duration: 1 }}
                />

                <motion.rect
                  x="70"
                  y="75"
                  width="20"
                  height="5"
                  rx="1"
                  fill="#059669"
                  initial={{ width: 0 }}
                  animate={{ width: 20 }}
                  transition={{ delay: 2.2, duration: 1 }}
                />

                {/* タイムライン - Textトラック */}
                <motion.rect
                  x="30"
                  y="85"
                  width="25"
                  height="5"
                  rx="1"
                  fill="#22c55e"
                  initial={{ width: 0 }}
                  animate={{ width: 25 }}
                  transition={{ delay: 2.4, duration: 1 }}
                />
              </svg>
            </div>

            {/* ローディングテキスト */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                <motion.span
                  animate={{ filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  映画制作中...
                </motion.span>
              </h2>
              <div className="flex gap-2 justify-center mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      y: [0, -10, 0],
                    }}
                    style={{ backgroundColor: '#688EA5' }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>

              {/* プログレスパーセント */}
              <motion.div
                className="text-sm text-emerald-300 font-mono"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {Math.floor(loadingProgress)}%
              </motion.div>
            </motion.div>

            {/* プログレスバー */}
            <div className="w-64 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(to right, #688EA5, #10b981)` 
                }}
              />
            </div>

            {/* 追加の装飾要素 - 円形のぼかし効果 */}
            <motion.div
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-xl"
              style={{ backgroundColor: 'rgba(104, 142, 165, 0.1)' }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-xl"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -10, 0],
                y: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;