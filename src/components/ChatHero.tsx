import { motion } from 'framer-motion';

const ChatHero = () => (
  <motion.div 
    className="w-full flex flex-col items-center justify-center py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 via-blue-50 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl shadow-xl p-10 max-w-xl w-full flex flex-col items-center transition-colors">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 flex items-center justify-center mb-6 shadow-lg">
        <svg
          className="w-12 h-12 text-indigo-400 dark:text-indigo-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          ></path>
        </svg>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">대한민국법률 챗봇</h1>
      <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-2 text-center font-semibold">
        정관 및 규정에 대한 궁금한 점을 자유롭게 물어보세요.
      </p>
      <div className="text-base md:text-lg font-bold text-blue-600 dark:text-blue-400 text-center mt-2">
        AI가 관련 조항을 찾아 정확한 답변을 드립니다.
      </div>
      <div className="text-base md:text-xs font-bold text-blue-800 dark:text-blue-300 text-center mt-2">
        ex) 대한민국헌법 제8조 알려줘
      </div>
    </div>
  </motion.div>
);

export default ChatHero;
