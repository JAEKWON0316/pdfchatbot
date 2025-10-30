"use client";
import { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { LoaderCircle } from 'lucide-react';

interface ChatInputProps {
  onSend: (input: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="flex-none w-full bg-white/80 dark:bg-gray-900/80 px-2 md:px-4 py-3 md:py-4 shadow-inner z-20 flex flex-col items-center transition-colors">
      <form className="w-full max-w-3xl flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl shadow-lg shadow-blue-100/40 dark:shadow-gray-800/40 border-b border-b-gray-100/30 dark:border-b-gray-700/30 border-l border-l-gray-100/30 dark:border-l-gray-700/30 border-r border-r-gray-100/30 dark:border-r-gray-700/30 border-t-transparent focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 text-sm md:text-base bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
          type="text"
          placeholder="질문을 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all duration-150
            ${(!input.trim() || isLoading)
              ? 'bg-gradient-to-br from-white via-gray-200 to-gray-400 text-gray-500 cursor-not-allowed scale-100'
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 text-white hover:scale-105 hover:from-blue-600 hover:to-purple-600'}
            disabled:opacity-60 disabled:cursor-not-allowed`
          }
          aria-label="메시지 전송"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin text-xl md:text-2xl text-blue-300" />
          ) : (
          <IoSend className="text-xl md:text-2xl" />
          )}
        </button>
      </form>
      <div className="w-full max-w-3xl flex flex-col items-center gap-1 mt-2">
        <div className="w-full flex justify-center hidden md:block">
          <div className="text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full shadow text-center transition-colors">
          <span className="font-semibold">Enter</span>로 전송, <span className="font-semibold">Shift+Enter</span>로 줄바꿈
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="text-xs md:text-sm text-blue-500 dark:text-blue-400 font-semibold text-center px-2">더 정확한 답변을 위해 구체적으로 질문해 주세요!</div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
