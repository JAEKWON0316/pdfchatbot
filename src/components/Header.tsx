'use client';

import { TbSparkles } from 'react-icons/tb';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onReset?: () => void;
}

const Header = ({ onReset }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex-none w-full flex justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-white/90 dark:bg-gray-900/90 shadow-sm z-10 transition-colors">
      <button onClick={onReset} className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
        <TbSparkles className="h-8 w-8 md:h-10 md:w-10 text-blue-500 dark:text-blue-400" />
        <div>
          <div className="font-bold text-base md:text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">JACK1 AI</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">AI 상담 서비스</div>
        </div>
      </button>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="테마 전환"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
        </button>
        <button className="px-3 py-1.5 md:px-4 md:py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-semibold shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:block">
          관리자
        </button>
      </div>
    </header>
  );
};

export default Header;
