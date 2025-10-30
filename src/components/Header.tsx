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
    <header className="flex-none w-full flex justify-between items-center px-8 py-4 bg-white/90 dark:bg-gray-900/90 shadow-sm z-10 transition-colors">
      <button onClick={onReset} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
        <TbSparkles className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        <div>
          <div className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">JACK1 AI</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">AI 상담 서비스</div>
        </div>
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="테마 전환"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-semibold shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          관리자
        </button>
      </div>
    </header>
  );
};

export default Header;
