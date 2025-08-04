import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountdownTimer: React.FC = () => {
    type TimeLeft = {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };

    const calculateTimeLeft = (): Partial<TimeLeft> => {
        // 目標日を設定（一旦、今年の12月31日に設定）
        const year = new Date().getFullYear();
        const difference = +new Date(`${year}-12-31T23:59:59`) - +new Date();
        let timeLeft: Partial<TimeLeft> = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<Partial<TimeLeft>>(calculateTimeLeft());
    const [isVisible, setIsVisible] = useState(false);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            // 画面の高さを80%以上スクロールしたら表示
            if (window.scrollY > window.innerHeight * 0.8) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 初期表示時にもチェック

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: JSX.Element[] = [];

    (Object.keys(timeLeft) as (keyof TimeLeft)[]).forEach((interval) => {
        if (timeLeft[interval] === undefined) {
            return;
        }
    
        timerComponents.push(
            <div key={interval} className="flex flex-col items-center md:mx-2">
                <span className="text-xl md:text-3xl font-bold font-mono tracking-tighter text-emerald-300">
                    {String(timeLeft[interval]).padStart(2, '0')}
                </span>
                <span className="text-[10px] leading-tight md:text-xs uppercase text-neutral-400">{interval}</span>
            </div>
        );
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={() => scrollToSection('crowdfunding')}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="fixed bottom-4 left-4 z-50 bg-neutral-900/80 backdrop-blur-md text-white p-2 rounded-lg shadow-2xl border border-white/10 flex items-center gap-x-3 md:block md:p-4 md:w-auto hover:bg-neutral-700/80 transition-colors"
                >
                    <h4 className="hidden md:block text-xs font-bold tracking-wider md:text-center md:mb-3">クラウドファンディング終了まで</h4>
                    <div className="flex flex-col gap-y-0.5 md:flex-row md:justify-center">
                        {timerComponents.length ? timerComponents : <span>プロジェクト終了</span>}
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default CountdownTimer;
