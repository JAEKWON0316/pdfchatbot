import { UserRound, Bot, Clock, Download, Loader2, FileText, AlertTriangle } from 'lucide-react';
import ThinkingDots from './ThinkingDots';
import { motion } from 'framer-motion';

interface ChatMessageCardProps {
  role: 'user' | 'bot';
  content: string;
  time: string;
  references?: string[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const ChatMessageCard = ({ role, content, time, references, isLoading, isError, onRetry }: ChatMessageCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`w-full flex ${role === 'user' ? 'justify-end' : 'justify-start'} items-start`}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {role === 'bot' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center mr-3 mt-1 shadow-md">
          {isLoading ? (
            <Loader2 className="text-xl text-purple-400 animate-spin" />
          ) : (
            <Bot className="text-xl text-purple-400" />
          )}
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-1 md:px-5 md:py-2 text-sm leading-relaxed tracking-normal whitespace-pre-wrap font-medium shadow transition-colors
        ${role === 'user'
            ? 'bg-gradient-to-br from-blue-400 to-blue-300 dark:from-blue-600 dark:to-blue-500 text-white border-none'
            : isError ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700'}
        `}
        style={{ minWidth: 60, maxWidth: 600 }}
      >
        {isError && role === 'bot' ? (
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>답변 생성 실패</span>
            </div>
            <p className="text-xs">죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.</p>
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 bg-white border border-red-300 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : isLoading && !content ? (
          <div className="flex items-center gap-3">
            <ThinkingDots />
            <span className="text-sm md:text-base text-gray-500">AI가 답변을 생성하고 있습니다</span>
          </div>
        ) : (
          content
        )}
        {role === 'bot' && !isError && references && references.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-3">
            <h4 className="font-semibold text-xs mb-2 text-gray-500 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              참고 문서
            </h4>
            <ul className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <li key={i}>
                  <a 
                    href={`/api/files/${encodeURIComponent(ref)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    {ref}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!isLoading && !isError && (
          <div className={`mt-1 text-[10px] flex items-center gap-1 ${role === 'user' ? 'text-blue-100 text-right justify-end' : 'text-gray-400 text-left justify-start'}`}>
            <Clock className="w-3 h-3 mr-0.5" />
            {time}
          </div>
        )}
      </div>
      {role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-sky-200 flex items-center justify-center ml-3 mt-1 shadow-md">
          <UserRound className="text-xl text-blue-400" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessageCard;
