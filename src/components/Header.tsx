import { TbSparkles } from 'react-icons/tb';

const Header = () => (
  <header className="flex-none w-full flex justify-between items-center px-8 py-4 bg-white/90 shadow-sm z-10">
    <a href="/" className="flex items-center gap-3 cursor-pointer">
      <TbSparkles className="h-10 w-10 text-blue-500" />
      <div>
        <div className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">JACK1 AI</div>
        <div className="text-xs text-gray-400">AI 상담 서비스</div>
      </div>
    </a>
    <button className="px-4 py-2 rounded bg-gray-100 text-gray-500 text-sm font-semibold shadow hover:bg-gray-200">관리자</button>
  </header>
);

export default Header;
