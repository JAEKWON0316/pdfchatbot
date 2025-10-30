import { FaRegComments } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';

interface ChatMessageWideProps {
  role: 'user' | 'bot';
  content: string;
  time: string;
  references?: string[];
}

export default function ChatMessageWide({ role, content, time, references }: ChatMessageWideProps) {
  return (
    <div className={`flex w-full mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'bot' && (
        <div className="flex flex-col items-start mr-4 mt-2">
          <div className="bg-purple-500 rounded-full p-2 text-white text-xl"><FaRegComments /></div>
        </div>
      )}
      <div className={`w-full max-w-3xl bg-white rounded-2xl px-8 py-5 flex flex-col ${role === 'user' ? 'ml-auto' : 'mr-auto'} shadow-none`}>
        <div className="text-base whitespace-pre-line break-words mb-2">{content}</div>
        {references && references.length > 0 && (
          <div className="mt-3 w-full">
            <div className="text-xs text-gray-400 mb-1">참고 문서</div>
            <div className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <a
                  key={i}
                  href={`/data/${ref}.pdf`}
                  download
                  className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border hover:bg-blue-100 transition"
                >
                  {ref}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className={`text-xs mt-3 ${role === 'user' ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>{time}</div>
      </div>
      {role === 'user' && (
        <div className="flex flex-col items-end ml-4 mt-2">
          <div className="bg-green-500 rounded-full p-2 text-white text-xl"><FaUserCircle /></div>
        </div>
      )}
    </div>
  );
}
